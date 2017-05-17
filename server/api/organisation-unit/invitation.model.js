'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  orgUnit: { type: Schema.Types.ObjectId, ref: 'OrgUnit', index : true},
  invitedBy : { type: String, ref: 'User', index: true},
  invitee : { type: String, ref: 'User'},
  assignedRole : String,
  isSignUpRequired: Boolean,
  isRequest : Boolean,
  isCompleted:  { 
    type: Boolean, 
    default: false
  }
},{
  timestamps : true
});

module.exports = mongoose.model('OrgInvitation', schema);