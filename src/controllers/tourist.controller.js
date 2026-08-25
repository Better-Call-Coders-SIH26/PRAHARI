const TouristPreference = require("../models/TouristPreference");

const getProfile = async (req, res, next) => {
  try {
    const preferences = await TouristPreference.findOne({
      touristId: req.user._id
    });

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role
        },
        preferences
      },
      message: "Tourist profile retrieved successfully"
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_NAME",
          message: "Name is required"
        }
      });
    }

    req.user.name = name.trim();

    await req.user.save();

    return res.status(200).json({
      success: true,
      data: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      message: "Profile updated successfully"
    });
  } catch (error) {
    next(error);
  }
};

const updatePreferences = async (req, res, next) => {
  try {
    const {
      weatherTolerance,
      riskTolerance,
      preferredActivities,
      accessibilityRequirements
    } = req.body;

    const allowedToleranceValues = [
      "LOW",
      "MEDIUM",
      "HIGH"
    ];

    if (
      weatherTolerance &&
      !allowedToleranceValues.includes(weatherTolerance)
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_WEATHER_TOLERANCE",
          message: "weatherTolerance must be LOW, MEDIUM, or HIGH"
        }
      });
    }

    if (
      riskTolerance &&
      !allowedToleranceValues.includes(riskTolerance)
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_RISK_TOLERANCE",
          message: "riskTolerance must be LOW, MEDIUM, or HIGH"
        }
      });
    }

    const preferences =
      await TouristPreference.findOneAndUpdate(
        { touristId: req.user._id },
        {
          ...(weatherTolerance && { weatherTolerance }),
          ...(riskTolerance && { riskTolerance }),
          ...(preferredActivities && {
            preferredActivities
          }),
          ...(accessibilityRequirements && {
            accessibilityRequirements
          })
        },
        {
          new: true,
          upsert: true,
          runValidators: true
        }
      );

    return res.status(200).json({
      success: true,
      data: preferences,
      message: "Tourist preferences updated successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePreferences
};