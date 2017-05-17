"use strict";

const Controller = require('../../lib/controller');
const conceptmatrixFacade  = require('./conceptmatrix-facade');

class ConceptmatrixController extends Controller {}

module.exports = new ConceptmatrixController(conceptmatrixFacade);
