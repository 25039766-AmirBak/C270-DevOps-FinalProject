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
const bookingRoutes = require("./routes/bookings"); // ADDED THIS
const locationRoutes = require("./routes/locations");

// Models
const User = require('./models/Users');
const FoodDonation = require('./models/FoodDonation');
const Request = require('./models/Request');

const app = express();
const PORT = process.env.PORT || 5000; // Define PORT here

app.use(cors());
app.use(express.json());
// Expose the uploads folder to the public
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Endpoints
app.use("/api/donations", donationRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/bookings", bookingRoutes); // ADDED THIS
app.use("/api/locations", locationRoutes); // ADDED THIS

app.get("/", (req, res) => {
  res.send("Food Donation API is running");
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    // Start server only after DB connects
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });

app.get('/api/stats', async (req, res) => {
  try {
    const mealsRescued = await FoodDonation.countDocuments(); 
    const activeVolunteers = await User.countDocuments({ 
        role: { $in: ['Volunteer'] }, 
        verificationStatus: 'Verified' 
    });
    const pendingRequests = await Request.countDocuments({ 
        status: 'Pending' 
    });

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