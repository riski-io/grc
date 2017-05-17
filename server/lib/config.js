/*
 * Environment based configuration
 */

'use strict';

var path = require('path');
var _ = require('lodash');
const env = process.env.NODE_ENV || 'development';
var configDir = path.resolve(__dirname + '/../../config');
var configPath = path.join(configDir, env);

function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: env,

  // Root path of server
  root: path.normalize(__dirname + '/../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'grc-secrhdoh8i98y9y9hididiet'
  },

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },
  auth0 : {
    clientID : process.env.AUTH0_CLIENT_ID,
    clientSecret : process.env.AUTH0_CLIENT_SECRET,
    domain : process.env.AUTH0_DOMAIN,
    audience : process.env.AUTH0_AUDIENCE,
    connection : process.env.AUTH0_CONNECTION
  },
  auth0API : {
    clientID : process.env.AUTH0_API_CLIENT_ID,
    clientSecret : process.env.AUTH0_API_CLIENT_SECRET,
    domain : process.env.AUTH0_API_DOMAIN,
    audience : process.env.AUTH0_API_AUDIENCE,
    connection : process.env.AUTH0_API_CONNECTION
  },
  elasticsearch : {
    host : process.env.ELASTICSEARCH_HOST,
    port : process.env.ELASTICSEARCH_PORT
  },
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require(configPath) || {});