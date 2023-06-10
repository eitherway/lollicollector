const logger = require("../modules/logger");
const axios = require("axios").create({
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
  baseURL: `https://atlas.microsoft.com`,
});
const SunCalc = require("suncalc");

let weatherData = null;

// documented here: https://learn.microsoft.com/en-us/rest/api/maps/weather/get-daily-forecast?tabs=HTTP
const getWeatherData = async () => {
  logger.log("info", "Refreshing weather data");
  const response = await axios.get(
    `/weather/forecast/daily/json?api-version=1.1&query=${process.env.GPS_LAT},${process.env.GPS_LON}&duration=1&subscription-key=${process.env.AZURE_MAPS_SUBSCRIPTION_KEY}`
  );
  const data = response.data;

  if (typeof data === "object") {
    return data;
  } else {
    throw new Error("Weather data is not a string");
  }
};

let lastCacheDate = null;

const refreshCache = async () => {
  let shouldRefreshCache = false;

  if (lastCacheDate === null) {
    shouldRefreshCache = true;
  }

  const currentDate = new Date().getTime() / 1000;
  if (currentDate - 2 * 60 * 60 > lastCacheDate) {
    // refresh every 2 hours
    shouldRefreshCache = true;
  }

  if (!shouldRefreshCache) {
    return;
  }

  try {
    weatherData = await getWeatherData();
  } catch (e) {
    logger.log("error", "Error when refreshing weather cache", {
      responseData: e.response ? e.response.data : null,
    });
    throw new Error("Error when refreshing weather cache");
  }
  lastCacheDate = currentDate;
};

const WeatherService = {};

WeatherService.getWeatherShortPhrase = async () => {
  await refreshCache();
  return weatherData.forecasts[0].day.shortPhrase;
};

WeatherService.getSunset = async () => {
  const sunTimes = SunCalc.getTimes(
    new Date(),
    process.env.GPS_LAT,
    process.env.GPS_LON
  );

  const sunsetStr =
    sunTimes.sunset.getHours() + ":" + sunTimes.sunset.getMinutes();
  return sunsetStr;
};

module.exports = WeatherService;
