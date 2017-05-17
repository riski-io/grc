"use strict";

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
import express from 'express';
import mongoose from 'mongoose';
import config from './lib/config';
import logger from './lib/logger';
import app from './lib/express';

mongoose.Promise = require('bluebird');
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', err => {
	logger.error(`MongoDB connection error: ${err}`);
	process.exit(-1);
});

process.on('uncaughtException', function (err) {
  logger.error((new Date()).toUTCString() + ' uncaughtException:', err);
  logger.error(err.stack);
  process.exit(1);
});


// Start server
function startServer() {
  app.listen(config.port, () => {
    logger.info(`server started on port ${config.port} (${config.env})`);
  });
}
setImmediate(startServer);
// Expose app
exports = module.exports = app;