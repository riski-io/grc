import mongoose from 'mongoose';
import _ from 'lodash';
import autopopulate from 'mongoose-autopopulate';
import autoIncrement from '../../lib/mongoose-auto-increment';
import mongoelastic from '../../lib/mongoelastic-hooks';
import logger from '../../lib/logger';
const controller = require('./governancerecord-controller');
const history = require ('../audithistory/audithistory-plugin');
const config = require('../../lib/config');
const esMapping = require('./es-mapping');
const Schema   = mongoose.Schema;
const emailUtils = require('../util/emailUtils');
//const validate = require('express-validation');

const schema = new Schema({
  title: {type: String},
  status: {type: String},
  version: {type: Number,default: 1},
  description: {type: String},
  responsibleOrg: {type: Schema.Types.ObjectId,ref: 'OrgUnit',index: true,autopopulate: { select: 'orgCode orgName'}},
  nominatedReviewer: {type: String,ref: 'User',autopopulate: { select: 'display_name email'}},
  responsibleUser: {type: String,ref: 'User',autopopulate: { select: 'display_name email'}},
  category: {type: String},
  externalFactors: {type : Array},
  assessment: [{risk: String,category: {  type: String},reviewType: {  type: String}, controls: [{control: {type: String,ref: 'Control',index: true, autopopulate: { select: 'title category status'}},  effectiveness: String}],initialAssessment: {  cost: Number,  consequence: Number,  likelihood: Number,  rating: Number},controlledAssessment: {  cost: Number,  consequence: Number,  likelihood: Number,  rating: Number}}],
  reviewType: {type: String},
  overallAssessment: {initialRating: Number,initialCost: Number,initialConsequence: Number,initialLikelihood: Number,controlledConsequence: Number,controlledLikelihood: Number,controlledRating: Number,controlledCost: Number,targetLikelihood: Number,targetConsequence: Number,targetRating: Number,targetCost: Number},
  identifiedAt: {type: String,ref: 'Review',index: true, autopopulate: { select: 'title reviewType status'}}
},{
	timestamps : true
});

schema.plugin(history.plugin);

autoIncrement.initialize(mongoose);
schema.plugin(autoIncrement.plugin, {
  model: 'GovernanceRecord',
  startAt: 1,
  prefix: 'G-'
});
schema.plugin(autopopulate);

schema.pre('save', function(next) {
  if (this.assessment) {
    this.assessment = _.map(this.assessment, function (assessment) {
      assessment.controls = assessment.controls || [];
      if (assessment.controls.length === 0) {
        assessment.controlledAssessment = assessment.initialAssessment;
      }
      return assessment;
    });
  }
  this.overallAssessment = controller.getOverallAssessment(this.assessment);
  next();
});

schema.post('save', function(doc, next) {
  var users = [];
  if (doc.identifiedAt && doc.identifiedAt.participantList) {
    users = _.union(users, doc.identifiedAt.participantList);
  }
  if (doc.nominatedReviewer) {
    users = _.union(users, [doc.nominatedReviewer]);
  }
  if (doc.responsibleUser) {
    users = _.union(users, [doc.responsibleUser]);
  }
  if (users.length === 0) {
    return next(null, doc);
  }
  var template = 'record.updated';
  emailUtils.send(users, [], template, {
    record: doc
  }, function(err) {
    if (err) {
      logger.error('Email sending failed for ' + template + ' - ' + doc._id, err);
    } else {
      logger.info('Email sent successfully for ' + template + ' - ' + doc._id);
    }
    next(null, doc);
  });
});

mongoelastic.setUpMongoMiddlewareHooks(schema, config.es.index, 'GOVERNANCE_RECORD', esMapping.mapping, esMapping.transform);

module.exports = mongoose.model('GovernanceRecord', schema);
