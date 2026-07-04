const express = require("express");
const router = express.Router();

const Request = require("../models/Request");

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

module.exports = router;