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


// 2. Create Express app
const app = express();


// 3. Middleware
app.use(cors());
app.use(express.json());


// 4. Test route
app.get("/", (req, res) => {
    res.send("Food Donation API is running");
});


// 5. Import donation routes
const donationRoutes = require("./routes/donationRoutes");

app.use("/api/donations", donationRoutes);


// 6. Connect MongoDB
mongoose.connect(process.env.MONGO_URI)

.then(() => {

    console.log("MongoDB Connected");


    // 7. Start server
    app.listen(process.env.PORT || 5000, () => {

        console.log("Server running on port 5000");

    });

})


.catch((error) => {

    console.log("MongoDB connection error:");
    console.log(error);

});