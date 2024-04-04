var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");

const carsData = require('../assets/cars.json')

const Car = require("../models/Car");
const isAuthenticated = require('../middleware/isAuthenticated');
const isDealershipOwner = require('../middleware/isDealershipOwner'); // Assume you create this similar to isAdmin

// Create a car (Dealership-owner only)
router.post("/", isAuthenticated, isDealershipOwner, (req, res, next) => {
  const { make, model, year, price, condition, mileage, dealershipId} = req.body;

   // Check if images are provided in the request; if not, use the default image
   let images = req.body.images;
   if (!images || images.length === 0) {
     images = ["https://cartistic.com/img/placeholder-vehicle.jpg"];
   }
  
  Car.create({
    make,
    model,
    year,
    price,
    condition,
    mileage,
    dealershipId,
    images
  })
  .then((createdCar) => {
    console.log("Created car ===>", createdCar);
    res.status(201).json(createdCar);
  })
  .catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
});

// Get all cars (Dealership-owner only)
router.get("/", (req, res, next) => {
  Car.find()
    .then((foundCars) => {
      console.log("Found cars ===>", foundCars);
      res.json(foundCars);
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
});



router.get("/:dealershipId", async (req, res, next) => {

  try {
    const {dealershipId} = req.params
    const carsFromDealership = await Car.find({dealershipId: dealershipId})

    return res.status(200).json(carsFromDealership)
  } catch (error) {
    console.log(error)
    return res.status(500).json({msg: "error getting cars from specific dealership"})
  }
  
    
});
// Get a specific car by ID (Dealership-owner only)
router.get("/:carId", (req, res, next) => {
  const { carId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(carId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Car.findById(carId)
    .then((foundCar) => {
      console.log("Found car ===>", foundCar);
      res.json(foundCar);
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
});

// Update a car (Dealership-owner only)
router.put("/:carId", isAuthenticated, isDealershipOwner, (req, res, next) => {
  const { carId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(carId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Car.findByIdAndUpdate(carId, req.body, { new: true })
    .then((updatedCar) => {
      console.log("Updated car ====>", updatedCar);
      res.json(updatedCar);
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
});

// Delete a car (Dealership-owner only)
router.delete("/:carId", isAuthenticated, isDealershipOwner, (req, res, next) => {
  const { carId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(carId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  Car.findByIdAndDelete(carId)
    .then(() => {
      res.json({ message: "Car deleted successfully" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// router.post('/one-time', (req, res, next) => {
//   Car.create(carsData)
//     .then((createdCars) => {
//       console.log("These are the created cars", createdCars)
//       res.json(createdCars)
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json(err);
//     });
// })

module.exports = router;
