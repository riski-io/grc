import mongoose from 'mongoose';
import logger from '../../lib/logger';
import _ from 'lodash';
import mongoelastic from '../../lib/mongoelastic-hooks';
import autopopulate from 'mongoose-autopopulate';
import autoIncrement from '../../lib/mongoose-auto-increment';
const Schema   = mongoose.Schema;
const history = require ('../audithistory/audithistory-plugin');
const config = require('../../lib/config');
const esMapping = require('./es-mapping');
const emailUtils = require('../util/emailUtils');

const schema = new Schema({
  title: {type : String},
  responsibleOrg: {type: Schema.Types.ObjectId, ref: 'OrgUnit', index : true, autopopulate: { select: 'orgCode orgName'}},
  createdBy: { type: String,ref: 'User', autopopulate: { select: 'display_name email'}},
  scheduleType: {type : String},
  reviewType: {type : String},
  version: {type : Number,default : 1},
  status: {type : String},
  description: {type : String},
  participantList : [{ type: String, ref: 'User',autopopulate: { select: 'display_name email'}}]
},{
	timestamps : true
});

autoIncrement.initialize(mongoose);
schema.plugin(autoIncrement.plugin, {
  model: 'Review',
  startAt: 1,
  prefix: 'R-'
});
schema.plugin(history.plugin);
schema.plugin(autopopulate);


schema.pre('save', function (next) {
    this.wasNew = this.isNew;
    next();
});

schema.post('save', function(doc, next) {
  var self = this;
  var template = 'review.updated';
  if (doc.wasNew) {
    template = 'review.scheduled';
  }
  var users = [];
  if (doc.participantList) {
    users = _.union(users , doc.participantList);
  }
  if (doc.scheduleType) {
    users = _.union(users , [doc.scheduleType]);
  }
  emailUtils.send(users, [], template, {review: doc}, function(err) {
    if (err) {
      logger.error('Email sending failed for '+ template + ' - '+doc._id, err);
    }else{
      logger.info('Email sent successfully for '+ template+ ' - '+doc._id);
    }
    next(null, doc);
  });
});

mongoelastic.setUpMongoMiddlewareHooks(schema, config.es.index, 'REVIEW', esMapping.mapping, esMapping.transform);
module.exports = mongoose.model('Review', schema);
