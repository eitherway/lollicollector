const express = require("express"),
  middleware = require("./modules/middleware"),
  logger = require("./modules/logger"),
  WeatherService = require("./services/WeatherService");

const app = express();

/**
 * Website
 */
app.get(
  "/",
  middleware.asyncHelper(async function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
  })
);
app.use("/deps/photoswipe", express.static("node_modules/photoswipe/dist/"));
app.use("/deps/pico", express.static("node_modules/@picocss/pico/css/"));

/**
 * API
 */

app.get(
  "/weather",
  middleware.asyncHelper(async (req, res) => {
    const weatherData = await WeatherService.getWeatherShortPhrase();
    res.send(weatherData);
  })
);

app.get(
  "/sunset",
  middleware.asyncHelper(async (req, res) => {
    const sunsetData = await WeatherService.getSunset();
    res.send(sunsetData);
  })
);

app.use("/door_camera", require("./routes/door_camera"));

const port = process.env.BACKEND_PORT || 5444;
const server = app.listen(port, () => {
  logger.log("info", `Server listening at http://localhost:${port}.`);
});

process.on("SIGINT", async function () {
  await shutdownServer();
});

process.on("SIGTERM", async function () {
  await shutdownServer();
});

process.on("uncaughtException", async function (err) {
  logger.log(
    "crit",
    "Uncaught Exception. This shouldn't have happened and couldn't be automatically fixed.",
    { name: err.name, errorMessage: err.message, errorStack: err.stack }
  );
  await shutdownServer();
});

async function shutdownServer() {
  try {
    logger.log("info", "Server is gracefully shutting down.");
    await server.close();
    logger.log("info", "Server was shutdown!");
  } catch (e) {
    logger.log("error", "Error when shutting down Server", e);
  } finally {
    process.exit();
  }
}
