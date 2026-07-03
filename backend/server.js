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
require("dotenv").config();

const donationRoutes = require("./routes/donationRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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