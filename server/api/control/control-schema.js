import mongoose from 'mongoose';
import logger from '../../lib/logger';
import _ from 'lodash';
const Schema   = mongoose.Schema;
import autopopulate from 'mongoose-autopopulate';
import autoIncrement from '../../lib/mongoose-auto-increment';
import mongoelastic from '../../lib/mongoelastic-hooks';
const history = require ('../audithistory/audithistory-plugin');
const config = require('../../lib/config');
const esMapping = require('./es-mapping');
const emailUtils = require('../util/emailUtils');

const schema = new Schema({
  title: {type : String, required : true},
  description: {type : String},
  version: {type : Number,default : 1},
  effectiveFrom: {type : Date},
  effectiveTo: {type : Date},
  responsibleOrg: {type: Schema.Types.ObjectId,ref: 'OrgUnit',index : true,required : true,autopopulate: { select: 'orgCode orgName'}},
  responsibleUser: {type: String,ref: 'User', autopopulate: { select: 'display_name email'}},
  category: {type : String},
  tags: [{type : String}],
  status: {type : String}
},{
	timestamps: true
});

schema.plugin(history.plugin);
autoIncrement.initialize(mongoose);
schema.plugin(autoIncrement.plugin, {
  model: 'Control',
  startAt: 1,
  prefix: 'C-'
});
schema.plugin(autopopulate);

schema.pre('save', function (next) {
    this.wasNew = this.isNew;
    next();
});

schema.post('save', function(doc, next) {
  var template = 'control.updated';
  if (doc.wasNew) {
    template = 'control.new';
  }
  emailUtils.send(doc.responsibleUser, [], template, {control: doc}, function(err) {
    if (err) {
      logger.error('Email sending failed for '+ template + ' - '+doc._id, err);
    }else{
      logger.info('Email sent successfully for '+ template+ ' - '+doc._id);
    }
    next(null, doc);
  });
});

mongoelastic.setUpMongoMiddlewareHooks(schema, config.es.index, 'CONTROL', esMapping.mapping, esMapping.transform);
module.exports = mongoose.model('Control', schema);
