const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({

    foodName: {
        type: String,
        required: true
    },

    donationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Donation",
        required: true
    },

    requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
    },

    message: {
        type: String,
        trim: true
    },

    quantityRemaining: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Request", requestSchema);