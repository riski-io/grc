"use strict";
import mongoose from 'mongoose';
const Schema   = mongoose.Schema;


const emailtemplateSchema = new Schema({
  key: {type: String, unique : true, required: true, index: true},
  trigger : { type : String, required: true},
  recipients : { type : String, required: true},
  subject: { type : String, required: true},
  body: {type : String, required: true}
}, {
	timestamps: true
});


module.exports = mongoose.model('Emailtemplate', emailtemplateSchema);
