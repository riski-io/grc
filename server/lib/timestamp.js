'use strict';
/* jshint ignore:start */
/*!
 * Mongoose Timestamps Plugin
 */
function timestampsPlugin(schema) {
  var updatedAt = 'updatedAt';
  var createdAt = 'createdAt';

  schema.pre('save', function(next) {
    var date = new Date()
    date = date.toUTCString();
    if (!this[createdAt]) {
      this[createdAt] = this[updatedAt] = date
    } else if (this.isModified()) {
      this[updatedAt] = date;
    }
    next();
  });

  schema.pre('findOneAndUpdate', function(next) {
    var date = new Date()
    date = date.toUTCString();
    if (this.op === 'findOneAndUpdate') {
      this._update = this._update || {};
      this._update[updatedAt] = date;
      this._update['$setOnInsert'] = this._update['$setOnInsert'] || {};
      this._update['$setOnInsert'][createdAt] = date;
    }
    next();
  });

  schema.pre('update', function(next) {
    var date = new Date()
    date = date.toUTCString();
    if (this.op === 'update') {
      this._update = this._update || {};
      this._update[updatedAt] = date;
      this._update['$setOnInsert'] = this._update['$setOnInsert'] || {};
      this._update['$setOnInsert'][createdAt] = date;
    }
    next();
  });

  if (!schema.methods.hasOwnProperty('touch')){
    var date = new Date()
    date = date.toUTCString();
    schema.methods.touch = function(callback) {
      this[updatedAt] = date;
      this.save(callback)
    }
  }

}

module.exports = timestampsPlugin;