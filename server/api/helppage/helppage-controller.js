"use strict";

const Controller = require('../../lib/controller');
const helppageFacade  = require('./helppage-facade');

class HelppageController extends Controller {}

module.exports = new HelppageController(helppageFacade);
