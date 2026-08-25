const express = require("express");

const {
  register,
  login,
  getMe
} = require("../controllers/auth.controller");

const authenticate = require("../middleware/auth");

const {
  validateRegister,
  validateLogin
} = require("../validators/auth.validator");

const router = express.Router();

router.post(
  "/register",
  validateRegister,
  register
);

router.post(
  "/login",
  validateLogin,
  login
);

router.get(
  "/me",
  authenticate,
  getMe
);

module.exports = router;