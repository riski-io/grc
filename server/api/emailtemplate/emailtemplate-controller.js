"use strict";

const Controller = require('../../lib/controller');
const emailtemplateFacade  = require('./emailtemplate-facade');

class EmailtemplateController extends Controller {}

module.exports = new EmailtemplateController(emailtemplateFacade);
