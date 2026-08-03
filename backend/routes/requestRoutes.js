// Ahmad
const express = require("express");
const router = express.Router();
const Request = require("../models/Request");
const { sendRequestUpdateEmail } = require('../utils/mailer');

// Get all requests
router.get("/", async (req, res) => {
    try {
        const requests = await Request.find();
        res.json(requests);
    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

// Create a new request
router.post("/", async (req, res) => {
    try {
        const request = new Request(req.body);

        await request.save();

        res.status(201).json(request);

    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
});

// Delete a request
router.delete("/:id", async (req, res) => {
    try {
        const deletedRequest = await Request.findByIdAndDelete(req.params.id);

        if (!deletedRequest) {
            return res.status(404).json({
                message: "Request not found"
            });
        }

        res.json({
            message: "Request deleted successfully"
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

// Update request status
router.put("/:id", async (req, res) => {
    try {
        // Use .populate('requestedBy') to grab the user's email address
        const updatedRequest = await Request.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        ).populate('requestedBy', 'email');

        if (!updatedRequest) {
            return res.status(404).json({ message: "Request not found" });
        }

        // Send Email Notification
        if (updatedRequest.requestedBy && updatedRequest.requestedBy.email) {
            sendRequestUpdateEmail(
                updatedRequest.requestedBy.email, 
                updatedRequest.foodName, 
                updatedRequest.status
            );
        }

        res.json(updatedRequest);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;