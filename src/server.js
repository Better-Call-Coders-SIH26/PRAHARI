const app = require("./app");
const connectDatabase = require("./config/database");
const env = require("./config/env");

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(env.port, () => {
      console.log("");
      console.log("====================================");
      console.log("       PRAHARI BACKEND STARTED      ");
      console.log("====================================");
      console.log(`Environment: ${env.nodeEnv}`);
      console.log(`Port: ${env.port}`);
      console.log(`URL: http://localhost:${env.port}`);
      console.log("");
    });
  } catch (error) {
    console.error("Failed to start PraHari backend");
    console.error(error);
    process.exit(1);
  }
};

startServer();