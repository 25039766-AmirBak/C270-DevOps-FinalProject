const express = require("express");
const Donation = require("../models/Donation");
const Request = require("../models/Request");

const router = express.Router();


// Get all donations
router.get("/", async(req,res)=>{

    const donations = await Donation.find();

    res.json(donations);

});


// Create donation
router.post("/", async(req,res)=>{

    const donation = new Donation(req.body);

    await donation.save();

    res.json(donation);

});

// Update donation quantity
router.put("/:id", async (req, res) => {
    try {
        const updatedDonation = await Donation.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedDonation) {
            return res.status(404).json({
                message: "Donation not found"
            });
        }

        const LOW_STOCK_THRESHOLD = 20;

        if (updatedDonation.quantity < LOW_STOCK_THRESHOLD) {

            const existingRequest = await Request.findOne({
                donationId: updatedDonation._id,
                status: "Pending"
            });

            if (!existingRequest) {
                await Request.create({
                    foodName: updatedDonation.foodName,
                    donationId: updatedDonation._id,
                    quantityRemaining: updatedDonation.quantity
                });
            }
        }

        res.json(updatedDonation);

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
});

module.exports = router;