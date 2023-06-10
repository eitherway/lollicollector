const { formatInTimeZone } = require("date-fns-tz");
const multer = require("multer");
const middleware = require("../modules/middleware");
const { readdir } = require("node:fs/promises");
const express = require("express");
const logger = require("../modules/logger");

const router = express.Router();

const storage = require("../modules/CustomFileStorage")({
  destination: function (req, file, cb) {
    cb(null, "./uploads/door_camera");
  },
  filename: function (req, file, cb) {
    const date = formatInTimeZone(new Date(), "UTC", "yyyy-MM-dd_HH-mm-ss");
    cb(null, `${date}.jpg`);
  },
});

const upload = multer({ storage: storage });

router.get(
  "/",
  middleware.asyncHelper(async function (req, res) {
    const files = await readdir("./uploads/door_camera");

    // reverse files as we want the newest images first in our view
    res.json(files.reverse());
  })
);

router.post("/", upload.single("img"), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  logger.log("debug", "Image received from door camera.");
  res.send("OK");
});

router.use("/", express.static("uploads/door_camera"));

module.exports = router;
