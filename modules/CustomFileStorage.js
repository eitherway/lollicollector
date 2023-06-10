var fs = require("fs");
const crypto = require("crypto");
const path = require("path");

function getFilename(req, file, cb) {
  crypto.randomBytes(16, function (err, raw) {
    cb(err, err ? undefined : raw.toString("hex"));
  });
}

function getDestination(req, file, cb) {
  cb(null, "/dev/null");
}

function CustomFileStorage(opts) {
  this.getFilename = opts.filename || getFilename;

  if (typeof opts.destination === "string") {
    this.getDestination = function ($0, $1, cb) {
      cb(null, opts.destination);
    };
  } else {
    this.getDestination = opts.destination || getDestination;
  }
}

CustomFileStorage.prototype._handleFile = function _handleFile(req, file, cb) {
  var that = this;

  that.getDestination(req, file, function (err, destination) {
    if (err) return cb(err);

    that.getFilename(req, file, function (err, filename) {
      if (err) return cb(err);

      var finalPath = path.join(destination, filename);
      var outStream = fs.createWriteStream(finalPath);

      file.stream.pipe(outStream);
      outStream.on("error", cb);
      outStream.on("finish", function () {
        cb(null, {
          destination: destination,
          filename: filename,
          path: finalPath,
          size: outStream.bytesWritten,
        });
      });
    });
  });
};

CustomFileStorage.prototype._removeFile = function _removeFile(req, file, cb) {
  var path = file.path;

  delete file.destination;
  delete file.filename;
  delete file.path;

  fs.unlink(path, cb);
};

module.exports = function (opts) {
  return new CustomFileStorage(opts);
};
