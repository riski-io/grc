"use strict";
import mongoose from 'mongoose';
const Schema   = mongoose.Schema;


const enumItemSchema = new Schema({
  key: {type: String, index : true},
  code: String,
  title: String,
  description: String
},{
	timestamps : true
});

enumItemSchema.index({ key: 1, code: 1 }, { unique: true });
module.exports = mongoose.model('EnumItem', enumItemSchema);
