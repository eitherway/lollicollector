const winston = require("winston");
const format = winston.format;
const { configure } = require("safe-stable-stringify");

const stringify = configure({
  bigint: false,
  circularValue: "[Circular]",
  deterministic: true,
  strict: false,
  maximumDepth: 4,
});

/*
    Log via different log levels with the sd-daemon:
    https://stackoverflow.com/questions/47313016/systemd-how-to-set-default-log-level-for-messages-on-stdout-stderr
    https://www.freedesktop.org/software/systemd/man/sd-daemon.html#
   Logging levels are (as defined by RFC5424):
   {
      emerg: 0,
      alert: 1,
      crit: 2,
      error: 3,
      warning: 4,
      notice: 5,
      info: 6,
      debug: 7
    }
 */

const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  level: "debug",
  transports: [],
});

//
// If we're not in production then log to the `console` with the format:
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: format.combine(
        format.errors({ stack: true }),
        format.colorize(),
        format.simple()
      ),
      level: "debug",
    })
  );
} else {
  // log looks like this: <7>{"message":"Example app listening at http://localhost:4090"}
  logger.add(
    new winston.transports.Console({
      format: format.printf((info) => {
        const numberSyslogLevel = winston.config.syslog.levels[info.level];
        delete info.level;
        const strObj = stringify(info).replace(/\r?\n|\r/g, " "); // make a safe string and no line breaks
        return `<${numberSyslogLevel}>${strObj}`;
      }),
      handleRejections: true,
      handleExceptions: true,
      level: "info",
    })
  );
}

// Test this
/*
const bigint = { a: 0, c: 2n, b: 1 }

const circular = { b: 1, a: 0 }
circular.circular = circular

logger.log('info', 'bigint', bigint)
logger.log('info', 'cirg', circular)
 */

module.exports = logger;
