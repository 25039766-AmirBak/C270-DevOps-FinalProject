const crypto = require('crypto');
if (!globalThis.crypto) {
    globalThis.crypto = crypto;
}

require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const donationRoutes = require("./routes/donationRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.get("/", (req, res) => {
  res.send("Food Donation API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/donations", donationRoutes);

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

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Server error',
  });
});

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
