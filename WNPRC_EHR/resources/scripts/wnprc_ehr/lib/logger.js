var console = require("console");

var logger = {};
exports.Logger = logger;


logger.LOG_LEVELS = {
    DEBUG: 10,
    INFO:  20,
    WARN:  30,
    ERROR: 40,
    FATAL: 50
};

logger.threshold = logger.LOG_LEVELS.INFO;

var writeMessage = function(level, message) {
    // Don't display messages less than the logger level.
    if (level < logger.threshold) {
        return;
    }

    if (level >= logger.LOG_LEVELS.ERROR) {
        console.error("\u2718 " + message);
    }
    else if (level >= logger.LOG_LEVELS.WARN) {
        console.warn("\u26A0 " + message);
    }
    else {
        console.log("\u2714 " + message);
    }
};

logger.debug = function(message) {
    writeMessage(logger.LOG_LEVELS.DEBUG, message);
};

logger.info = function(message) {
    writeMessage(logger.LOG_LEVELS.INFO, message);
};

logger.warn = function(message) {
    writeMessage(logger.LOG_LEVELS.WARN, message);
};

logger.error = function(message) {
    writeMessage(logger.LOG_LEVELS.ERROR, message);
};

logger.fatal = function(message) {
    writeMessage(logger.LOG_LEVELS.FATAL, message);
};