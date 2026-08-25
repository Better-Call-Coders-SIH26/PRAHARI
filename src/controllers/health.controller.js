const mongoose = require("mongoose");
const env = require("../config/env");

const getHealth = (req, res) => {
  const databaseStatus =
    mongoose.connection.readyState === 1
      ? "CONNECTED"
      : "DISCONNECTED";

  const isHealthy = databaseStatus === "CONNECTED";

  return res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    data: {
      service: "prahari-backend",
      status: isHealthy ? "UP" : "DEGRADED",
      database: databaseStatus,
      environment: env.nodeEnv,
      timestamp: new Date().toISOString()
    },
    message: isHealthy
      ? "PraHari backend is healthy"
      : "PraHari backend is running but database is unavailable"
  });
};

module.exports = {
  getHealth
};