const jwt = require("jsonwebtoken");

const User = require("../models/User");
const env = require("../config/env");

const authenticate = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        error: {
          code: "AUTH_TOKEN_MISSING",
          message: "Authorization token is required"
        }
      });
    }

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_AUTH_HEADER",
          message: "Authorization header must use Bearer token"
        }
      });
    }

    const token = authorization.substring(7);

    const decoded = jwt.verify(token, env.jwtSecret);

    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User is no longer active"
        }
      });
    }

    req.user = user;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: {
          code: "TOKEN_EXPIRED",
          message: "Authentication token has expired"
        }
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Authentication token is invalid"
        }
      });
    }

    next(error);
  }
};

module.exports = authenticate;