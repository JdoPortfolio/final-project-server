const jwt = require("jsonwebtoken");
const User = require('../models/User'); // Adjust the path to match your directory structure

const enrichUserWithDealership = (req, res, next) => {
  if (req.user && !req.user.dealership) {
    User.findById(req.user._id)
      .then(user => {
        if (user && user.dealership) {
          req.user.dealership = user.dealership;
        }
        next();
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
      });
  } else {
    next();
  }
};

module.exports = enrichUserWithDealership;
