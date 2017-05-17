import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';
import mongoelastic from '../../lib/mongoelastic-hooks';
import autoIncrement from '../../lib/mongoose-auto-increment';

const config = require('../../lib/config');
const esMapping = require('./es-mapping');
const Schema   = mongoose.Schema;
const history = require ('../audithistory/audithistory-plugin');

const schema = new Schema({
  refEntityId: {type: String,required: true,index: true},
  refEntityType: {type: String, required: true, index: true},
  assignedTo: { type: String,ref: 'User',autopopulate: { select: 'display_name email'}},
  createdBy: {type: String,ref: 'User', autopopulate: { select: 'display_name email'}},
  responsibleOrg : { type: Schema.Types.ObjectId, ref: 'OrgUnit', index : true, required : true, autopopulate: { select: 'orgCode orgName'}},
  reviewType: {type: String},
  title: {type: String},
  description: {type: String},
  version: {type : Number, default : 1},
  status: {type: String},
  priority: {type: String},
  percentComplete: {type: Number},
  dueDate: {type: Date}
},{
	timestamps : true
});

schema.plugin(autopopulate);
schema.plugin(history.plugin);

autoIncrement.initialize(mongoose);
schema.plugin(autoIncrement.plugin, {
    model: 'ActionItem',
    startAt : 1,
    prefix : 'A-'
});

mongoelastic.setUpMongoMiddlewareHooks(schema, config.es.index, 'ACTIONITEM', esMapping.mapping, esMapping.transform);
module.exports = mongoose.model('ActionItem', schema);
