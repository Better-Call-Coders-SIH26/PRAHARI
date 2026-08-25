const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_NAME",
        message: "Name is required"
      }
    });
  }

  if (!email || typeof email !== "string") {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_EMAIL",
        message: "Email is required"
      }
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_EMAIL",
        message: "Please provide a valid email"
      }
    });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_PASSWORD",
        message: "Password is required"
      }
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: {
        code: "WEAK_PASSWORD",
        message: "Password must contain at least 6 characters"
      }
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: {
        code: "MISSING_CREDENTIALS",
        message: "Email and password are required"
      }
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin
};