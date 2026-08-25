const mongoose = require("mongoose");

const touristPreferenceSchema = new mongoose.Schema(
  {
    touristId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    weatherTolerance: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM"
    },

    riskTolerance: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM"
    },

    preferredActivities: {
      type: [String],
      default: []
    },

    accessibilityRequirements: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const TouristPreference = mongoose.model(
  "TouristPreference",
  touristPreferenceSchema
);

module.exports = TouristPreference;