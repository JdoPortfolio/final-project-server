
const isDealershipOwner = (req, res, next) => {
    if (req.user.privilege === 'dealership-owner') {
      next();
    } else {
      res.status(403).json({ message: "Access denied. Dealership-owner privileges required." });
    }
  };
  
  module.exports = isDealershipOwner;
  