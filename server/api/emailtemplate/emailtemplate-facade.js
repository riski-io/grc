"use strict";

const Model = require('../../lib/facade');
const emailtemplateSchema  = require('./emailtemplate-schema');

class EmailtemplateModel extends Model {}

module.exports = new EmailtemplateModel(emailtemplateSchema);
