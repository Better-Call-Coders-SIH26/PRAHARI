const express = require("express");

const authenticate = require("../middleware/auth");

const {
  getProfile,
  updateProfile,
  updatePreferences
} = require("../controllers/tourist.controller");

const router = express.Router();

router.use(authenticate);

router.get("/profile", getProfile);

router.put("/profile", updateProfile);

router.put("/preferences", updatePreferences);

module.exports = router;