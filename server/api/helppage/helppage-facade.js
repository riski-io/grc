"use strict";

const Model = require('../../lib/facade');
const helppageSchema  = require('./helppage-schema');

class HelppageModel extends Model {}

module.exports = new HelppageModel(helppageSchema);
