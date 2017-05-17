'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
  orgCode: String,
  orgName: String,
  ancestors : [{
  	id : String,
    name : String
  }],
  parent: { type: Schema.Types.ObjectId, ref: 'OrgUnit', index : true},
  members: [{
    userId : {type: String, ref: 'User'},
    role : {type: String}
  }],
  childList: [{ type: Schema.Types.ObjectId, ref: 'OrgUnit'}]
}, {
  timestamps : true
});

schema.set('toJSON', { virtuals: true });
schema.set('toObject', { virtuals: true });

schema.virtual('orgUnitId').get(function () {
  return this.id;
});
module.exports = mongoose.model('OrgUnit', schema);