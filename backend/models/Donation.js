const mongoose = require("mongoose");


const donationSchema = new mongoose.Schema({

    foodName: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    expiryDate: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        default: "Available"
    }

});


module.exports = mongoose.model(
    "Donation",
    donationSchema
);