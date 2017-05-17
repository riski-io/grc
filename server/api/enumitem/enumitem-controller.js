"use strict";
const Controller = require('../../lib/controller');
const EnumitemFacade  = require('./enumitem-facade');

class EnumitemController extends Controller {}

module.exports = new EnumitemController(EnumitemFacade);
