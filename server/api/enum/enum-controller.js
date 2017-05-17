"use strict";

const enumFacade  = require('./enum-facade');
const Controller = require('../../lib/controller');

class EnumController extends Controller {}

module.exports = new EnumController(enumFacade);
