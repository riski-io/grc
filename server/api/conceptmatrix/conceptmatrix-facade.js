"use strict";

const Model = require('../../lib/facade');
const conceptmatrixSchema  = require('./conceptmatrix-schema');

class ConceptmatrixModel extends Model {}

module.exports = new ConceptmatrixModel(conceptmatrixSchema);
