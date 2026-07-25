// --- NODE ENVIRONMENT POLYFILL ---
// Forces the crypto module into the global scope for MongoDB compatibility
const crypto = require('crypto');
if (!globalThis.crypto) {
    globalThis.crypto = crypto;
}

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

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userMessage,
            config: {
                systemInstruction: "You are the SharePlate Assistant, a helpful AI for a Singapore food donation platform. Keep answers under 3 sentences. Only answer questions related to food donation, the SharePlate platform, or volunteering. If asked to write essays or code, politely decline."
            }
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ reply: "I am currently offline. Please try again later." });
    }
});