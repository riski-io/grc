"use strict";
const Model = require('../../lib/facade');
const EnumitemSchema  = require('./enumitem-schema');

class EnumitemModel extends Model {}

module.exports = new EnumitemModel(EnumitemSchema);
