'use strict';
import winston from 'winston';

// inside our module, we use winston to implement
// our logger, but the rest of the app just uses
// a generic logger interface that we export.
// this decouples logging logic in our code from
// implementation with Winston.

const consoleOptions = {
  level: 'debug',
  handleExceptions: true,
  json: true,
  colorize: true
};

const logger = new (winston.Logger)({
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