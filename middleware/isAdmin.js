
const isAdmin = (req, res, next) => {
    if (req.user.privilege === 'admin') {
      next();
    } else {
      res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
  };
  
  module.exports = isAdmin;