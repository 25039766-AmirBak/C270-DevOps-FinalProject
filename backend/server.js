// Temporary compatibility fix:
// Some older Node.js environments may not expose crypto globally.
// Docker will standardise the runtime using Node 22.
const crypto = require("crypto");

if (!globalThis.crypto) {
  globalThis.crypto = crypto;
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const requestRoutes = require("./routes/requestRoutes");
require("dotenv").config();

const donationRoutes = require("./routes/donationRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/donations", donationRoutes);
app.use("/api/requests", requestRoutes);

app.get("/", (req, res) => {
  res.send("Food Donation API is running");
});

app.use("/api/donations", donationRoutes);

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