require("dotenv").config({ quiet: true });

const app = require("./src/app");
const env = require("./src/config/env");
const appLogger = require("./src/services/logService");
const urlRepository = require("./src/repositories/urlRepository");

async function startServer() {
  await urlRepository.ensureStore();

  const server = app.listen(env.port, () => {
    void appLogger.info(
      "config",
      `backend server started on port=${env.port} env=${env.nodeEnv}`,
    );
    console.log(`Backend server successfully started on port ${env.port}`);
  });

  server.on("error", (error) => {
    void appLogger.fatal(
      "config",
      `server listener error: ${error.message || "unknown error"}`,
    );
    console.error("Critical server error:", error);
    process.exit(1);
  });

  return server;
}

process.on("unhandledRejection", (reason) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  void appLogger.fatal("config", `unhandled rejection: ${message}`);
  console.error("Unhandled rejection:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  void appLogger.fatal("config", `uncaught exception: ${error.message}`);
  console.error("Uncaught exception:", error);
  process.exit(1);
});

startServer().catch(async (error) => {
  await appLogger.fatal(
    "config",
    `server bootstrap failed: ${error.message || "unknown error"}`,
  );
  process.exit(1);
});
