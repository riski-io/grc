"use strict";

import mongoose from 'mongoose';
const Schema   = mongoose.Schema;


const helppageSchema = new Schema({
  pageType : {
  	type: String,
    index : true
  },
  title: String,
  createdBy: { type: String, ref: 'User'},
  updatedBy: { type: String, ref: 'User'},
  content : String,
  order : Number
},{
  timestamps : true
});

module.exports = mongoose.model('Helppage', helppageSchema);
