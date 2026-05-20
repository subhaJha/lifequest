const express = require("express");

const {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();


// REGISTER ROUTE
router.post("/register", registerUser);

// LOGIN ROUTE
router.post('/login', loginUser);

// FORGOT PASSWORD ROUTE
router.post('/forgot-password', requestPasswordReset);

// RESET PASSWORD ROUTE
router.post('/reset-password', resetPassword);

module.exports = router;
