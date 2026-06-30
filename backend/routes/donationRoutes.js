const express = require("express");
const Donation = require("../models/Donation");

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


module.exports = router;