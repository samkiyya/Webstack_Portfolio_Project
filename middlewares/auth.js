const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyAdmin = async (req, res, next) => {
  try {
    let token;
    const cToken = req.cookies.adminToken;
    const hToken = req.headers['authorization']?.split(' ')[1];
    token = cToken || hToken;

    if (!token) {
      return res.status(403).json({ success: false, message: 'no token found' });
    }

    jwt.verify(token, process.env.JWT_ADMIN_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ success: false, message: 'invalid token' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const verifyUser = async (req, res, next) => {
  try {
    let token;
    const cToken = req.cookies.userToken;
    const hToken = req.headers['authorization']?.split(' ')[1];
    token = cToken || hToken;

    if (!token) {
      return res.status(403).json({ success: false, message: 'no token found' });
    }

    jwt.verify(token, process.env.JWT_USER_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ success: false, message: 'invalid token' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const verifyUserOrAdmin = async (req, res, next) => {
  try {
    const userToken = req.cookies.userToken;
    const adminToken = req.cookies.adminToken;
    const authHeader = req.headers['authorization']?.split(' ')[1];

    if (adminToken || authHeader) {
      // Admin is logged in
      return verifyAdmin(req, res, next);
    } else if (userToken) {
      // User is logged in
      return verifyUser(req, res, next);
    } else {
      // Neither user nor admin is logged in
      return res.status(403).json({ success: false, message: 'no token found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


module.exports = {
  verifyAdmin,
  verifyUser,
  verifyUserOrAdmin,
};
