const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:");
  console.error(err);

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : err.message
    }
  });
};

module.exports = errorHandler;