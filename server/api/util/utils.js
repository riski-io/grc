'use strict';

/**
 * Enable serialization for Error objects
 * 
 * @param {Boolean} includeStackTrace Include stacktrace to JSON
 */

var s3 = require('../../lib/s3');

module.exports.defineErrorToJSON = function(includeStackTrace) {
  Object.defineProperty(Error.prototype, 'toJSON', {
    value: function() {
      var alt = {};

      Object.getOwnPropertyNames(this).forEach(function(key) {
        if (includeStackTrace || key !== 'stack') {
          alt[key] = this[key];
        }
      }, this);

      return alt;
    },
    configurable: true
  });
};

module.exports.managerAWSServices = function () {
  //s3.findAndCreateBucket();
};