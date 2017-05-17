"use strict";

const Model = require('../../lib/facade');
const enumSchema  = require('./enum-schema');

class EnumModel extends Model {}

module.exports = new EnumModel(enumSchema);
