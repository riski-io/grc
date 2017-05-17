'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  refEntityId: {
    type: String,
    index: true,
  },
  displayName: String,
  s3key: String,
  publishedBy: { type: String, ref: 'User', index : true}
},{
	timestamps : true
});
module.exports = mongoose.model('Attachment', schema);