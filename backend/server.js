// 1. Import libraries
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');
require("dotenv").config();

// Routes
const donationRoutes = require("./routes/donationRoutes");
const requestRoutes = require("./routes/requestRoutes");
const authRoutes = require("./routes/authRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const locationRoutes = require("./routes/locations");
const bookingRoutes = require("./routes/bookings");

// Models
const User = require('./models/Users');
const Donation = require('./models/Donation');
const Request = require('./models/Request');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
// Expose the uploads folder to the public
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Endpoints
app.use("/api/donations", donationRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.send("Food Donation API is running");
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

app.get('/api/stats', async (req, res) => {
  try {
    // 1. Count how many total donations exist (or sum up their quantities)
    const mealsRescued = await Donation.countDocuments(); 
    
    // 2. Count how many users have the 'Volunteer' role AND are 'Verified'
    const activeVolunteers = await User.countDocuments({ 
        role: { $in: ['Volunteer'] }, 
        verificationStatus: 'Verified' 
    });

    // 3. Count how many requests are currently sitting as 'Pending'
    const pendingRequests = await Request.countDocuments({ 
        status: 'Pending' 
    });

    // Send it back to the React frontend
    res.status(200).json({
        mealsRescued: mealsRescued,
        activeVolunteers: activeVolunteers,
        pendingRequests: pendingRequests
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch live stats', error: error.message });
  }
});

// --- AI INTEGRATION ---
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// The Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        const userRole = req.body.role || 'Guest';

        const totalMeals = await Donation.countDocuments();
        const activeVolunteers = await User.countDocuments({ role: { $in: ['Volunteer'] }, verificationStatus: 'Verified' });
        const availableFood = await Donation.find({ status: "Available" }).select('foodName location quantity');
        const foodSummary = availableFood.map(f => `${f.quantity}x ${f.foodName} at ${f.location}`).join(', ') || "No food available currently.";

        const systemInstruction = `You are the SharePlate Assistant, a helpful AI for a Singapore food donation platform. 
        Keep answers under 3 sentences. Only answer questions related to food donation, the SharePlate platform, or volunteering. 
        
        CRITICAL REAL-TIME ACCURACY DATA:
        - Current platform stats: We have rescued ${totalMeals} meals and have ${activeVolunteers} active verified volunteers.
        - Exact food available right now in Singapore: [ ${foodSummary} ].
        
        USER CONTEXT:
        The user you are talking to is currently interacting with the platform as a: ${userRole}.
        - If they are a Donor, emphasize how to post donations and check recent postings.
        - If they are a Recipient, emphasize how to browse the interactive map and request food.
        - If they are a Volunteer, emphasize delivery routing and the scheduling calendar.
        - If they are a Guest, politely encourage them to register for an account to participate.
        
        Use this exact data and user context to answer users accurately. If asked to write essays or code, politely decline.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userMessage,
            config: {
                systemInstruction: systemInstruction
            }
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error("AI Error:", error.message);
        
        // Check if the error is specifically a 429 Rate Limit/Quota error
        if (error.status === 429) {
            return res.status(429).json({ 
                reply: "I am experiencing unusually high traffic right now. Please wait a minute and try again." 
            });
        }

        // Standard 500 fallback for all other errors
        res.status(500).json({ 
            reply: "I am currently offline or experiencing a server issue. Please try again later." 
        });
    }
});