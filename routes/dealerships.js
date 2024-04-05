var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");

const Dealership = require("../models/Dealership");
const isAuthenticated = require('../middleware/isAuthenticated');
const isAdmin = require('../middleware/isAdmin');

// Assuming User model is required at the top
const User = require("../models/User");

// Admin can create a dealership
router.post("/", isAuthenticated, isAdmin, (req, res, next) => {
  const { name, location, contact, owner, image } = req.body;
  
  Dealership.create({
    name,
    location,
    contact,
    owner,
    image
  })
  .then((createdDealership) => {
    console.log("Created dealership ===>", createdDealership);
    // Update the corresponding User document
    return User.findByIdAndUpdate(owner, { $set: { dealership: createdDealership._id } }, { new: true });
  })
  .then((updatedUser) => {
    console.log("Updated User with new Dealership ===>", updatedUser);
    res.status(201).json(updatedUser);
  })
  .catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
});

// Admin can see all dealerships
router.get("/", (req, res, next) => {
  Dealership.find()
    .populate("owner") // Populate owner details from User model
    .then((foundDealerships) => {
      console.log("Found Dealerships ===>", foundDealerships);
      res.json(foundDealerships);
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
});


router.get("/details/:dealershipId", (req, res, next) => {
  const { dealershipId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(dealershipId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }
  
  Dealership.findById(dealershipId)
    .populate("owner") // Populate owner details from User model
    .then((foundDealership) => {
      console.log("Found Dealership ===>", foundDealership);
      res.json(foundDealership);
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
});

// Dealership-owner can update their dealership
router.put("/update/:dealershipId", isAuthenticated, (req, res, next) => {
  const { dealershipId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(dealershipId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }
  
  Dealership.findById(dealershipId)
    .then((dealership) => {
      if (!dealership) {
        return res.status(404).json({ message: "Dealership not found" });
      }
      if (dealership.owner.toString() !== req.user._id) {
        return res.status(403).json({ message: "Unauthorized to update this dealership" });
      }
      
      Dealership.findByIdAndUpdate(dealershipId, req.body, { new: true })
        .then((updatedDealership) => {
          console.log("Updated Dealership ====>", updatedDealership);
          res.json(updatedDealership);
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json(err);
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// Admin can delete any dealership
router.delete("/delete/:dealershipId", isAuthenticated, isAdmin, (req, res, next) => {
  const { dealershipId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(dealershipId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  let ownerId = null;
  
  Dealership.findById(dealershipId)
    .then((dealership) => {
      if (!dealership) {
        throw new Error("Dealership not found");
      }
      ownerId = dealership.owner;
      return Dealership.findByIdAndDelete(dealershipId);
    })
    .then(() => {
      // If the dealership was successfully deleted, update the corresponding User document
      if (ownerId) {
        return User.findByIdAndUpdate(ownerId, { $unset: { dealership: "" } }, { new: true });
      }
    })
    .then((updatedUser) => {
      console.log("Updated User after Dealership deletion ===>", updatedUser);
      res.json({ message: "Dealership deleted successfully, and User updated." });
    })
    .catch((err) => {
      console.log(err.message);
      res.status(500).json({ message: err.message || "An error occurred" });
    });
});

module.exports = router;
