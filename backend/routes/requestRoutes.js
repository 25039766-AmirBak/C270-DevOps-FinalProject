const express = require("express");
const router = express.Router();

const Request = require("../models/Requests");

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

module.exports = router;