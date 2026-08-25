const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const touristRoutes = require("./routes/tourist.routes");

const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      service: "PraHari Backend",
      version: "1.0.0"
    },
    message: "PraHari backend is running"
  });
});

app.use("/api/health", healthRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/tourist", touristRoutes);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found`
    }
  });
});

app.use(errorHandler);

module.exports = app;