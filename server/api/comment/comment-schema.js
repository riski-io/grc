import mongoose from 'mongoose';
const Schema   = mongoose.Schema;
import autopopulate from 'mongoose-autopopulate';
const controller = require('./comment-controller');
const emailUtils = require('../util/emailUtils');

const schema = new Schema({
  refEntityId: {type: String,index: true},
  text: String,
  postedBy:  { type: String, ref: 'User', index : true,autopopulate: { select: 'display_name email'}}
},{
  timestamps : true
});
schema.plugin(autopopulate);

module.exports = mongoose.model('Comment', schema);
