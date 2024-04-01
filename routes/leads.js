var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");

const Lead = require("../models/Lead");
const isAuthenticated = require('../middleware/isAuthenticated');
const isDealershipOwner = require('../middleware/isDealershipOwner'); // Assuming this middleware exists as discussed earlier
const enrichUserWithDealership = require('../middleware/enrichUserWithDealership'); // Assuming this middleware exists as discussed earlier

// Create a lead (Open to anyone)
router.post("/", (req, res, next) => {
  const { name, email, phoneNumber, interestedIn, message, dealership, car } = req.body;
  
  Lead.create({
    name,
    email,
    phoneNumber,
    interestedIn,
    message,
    dealership,
    car
  })
  .then((createdLead) => {
    console.log("Created lead ===>", createdLead);
    res.status(201).json(createdLead);
  })
  .catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
});

// Get all leads (Dealership-owner only)
router.get("/", isAuthenticated, enrichUserWithDealership, isDealershipOwner, (req, res, next) => {
    console.log("User's Dealership ID:", req.user.dealership);
    Lead.find({ dealership: req.user.dealership }) // Adjust the query to match the user's dealership
      .populate("dealership")
      .populate("car")
      .then((foundLeads) => {
        // Filter the leads to only include those that belong to the user's dealership(s)
        const filteredLeads = foundLeads.filter(lead => lead.dealership._id.toString() === req.user.dealership.toString());
        console.log("Found leads for dealership ===>", filteredLeads);
        res.json(filteredLeads);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
});


// Get a specific lead by ID (Dealership-owner only)
// Get a specific lead by ID, only if it belongs to the dealership(s) owned by the authenticated user
router.get("/:leadId", isAuthenticated, enrichUserWithDealership, isDealershipOwner, (req, res, next) => {
    const { leadId } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      res.status(400).json({ message: "Specified id is not valid" });
      return;
    }
  
    Lead.findOne({ _id: leadId, dealership: { $in: [req.user.dealership] } }) // Adjust according to your schema
      .populate("dealership")
      .populate("car")
      .then((foundLead) => {
        if (!foundLead) {
          return res.status(404).json({ message: "Lead not found or does not belong to your dealership." });
        }
        console.log("Found lead ===>", foundLead);
        res.json(foundLead);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  });
  

// Delete a lead (Dealership-owner only)
router.delete("/:leadId", isAuthenticated, enrichUserWithDealership, isDealershipOwner, (req, res, next) => {
    const { leadId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).json({ message: "Specified id is not valid" });
    }
  
    // First, find the lead to ensure it's associated with the user's dealership
    Lead.findById(leadId)
      .then((lead) => {
        if (!lead) {
          return res.status(404).json({ message: "Lead not found." });
        }
        // Check if the lead's dealership matches the user's dealership
        if (lead.dealership.toString() !== req.user.dealership.toString()) {
          return res.status(403).json({ message: "Unauthorized to delete this lead." });
        }
        // If checks pass, proceed to delete the lead
        return Lead.findByIdAndDelete(leadId);
      })
      .then(() => {
        res.json({ message: "Lead deleted successfully" });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  });
  

module.exports = router;
