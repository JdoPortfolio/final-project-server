var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");

const bcrypt = require("bcryptjs");
const saltRounds = 10;

const User = require("../models/User");
const isAuthenticated = require('../middleware/isAuthenticated');
const isAdmin = require('../middleware/isAdmin');

// Admin can create dealership-owner accounts
router.post("/", isAuthenticated, isAdmin, (req, res, next) => {
  const { email, password, name, privilege, profilePicture } = req.body; // Include profilePicture in the destructuring

  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedPassword = bcrypt.hashSync(password, salt);
  
  User.create({
    email,
    password: hashedPassword, // Password is hashed
    name,
    privilege,
    profilePicture // This now includes the profilePicture from the request body
  })
  .then((createdUser) => {
    console.log("Created user ===>", createdUser);
    res.status(201).json(createdUser); // Consider omitting sensitive info
  })
  .catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
});

router.get("/", isAuthenticated, isAdmin, (req, res, next) => {
  User.find()
  .populate("dealership")
    .then((foundUsers) => {
      console.log("Found Users ===>", foundUsers);
      res.json(foundUsers);
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
});

// Route to get users by privilege
router.get("/privilege/:privilege", isAuthenticated, isAdmin, (req, res, next) => {
  const { privilege } = req.params;

  User.find({ privilege: privilege })
    .populate("dealership")
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Error fetching users by privilege." });
    });
});

// Only admin can find users
router.get("/details/:userId", (req, res, next) => {
  const { userId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }
  
  User.findById(userId)
  .populate("dealership")
    .then((foundUser) => {
      console.log("Found user ===>", foundUser);
      res.json(foundUser); // Consider omitting sensitive info
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
});

// Dealership-owner can only update their own profile
router.put("/update/:userId", isAuthenticated, (req, res, next) => {
  const { userId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(userId) || req.user._id !== userId ) {
    res.status(403).json({ message: "Unauthorized to update this profile" });
    return;
  }
  
  User.findByIdAndUpdate(userId, req.body, { new: true })
    .then((updatedUser) => {
      console.log("Updated user ====>", updatedUser);
      res.json(updatedUser); // Consider omitting sensitive info
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
});

// Admin can delete any user
router.delete("/delete/:userId", isAuthenticated, isAdmin, (req, res, next) => {
  const { userId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }
  
  User.findByIdAndDelete(userId)
    .then((deletedUser) => {
      console.log("Deleted user", deletedUser);
      res.json({ message: "User deleted successfully" });
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
});

module.exports = router;

