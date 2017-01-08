'use strict';
var winston = require('winston');

// inside our module, we use winston to implement
// our logger, but the rest of the app just uses
// a generic logger interface that we export.
// this decouples logging logic in our code from
// implementation with Winston.

var consoleOptions = {
  level: 'debug',
  handleExceptions: true,
  json: true,
  colorize: true
};

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(consoleOptions),
  ]
});

logger.stream = {
  write: (message, encoding) => {
    logger.debug(message);
  }
};

module.exports = {logger};
