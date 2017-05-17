"use strict";

import mongoose from 'mongoose';
const Schema   = mongoose.Schema;

const conceptmatrixSchema = new Schema({
  key: { type: String},
  code: { type: String},
  rating: {type: Number, validate: function(value) {  return value > 0;}},
  description: String
},{
  timestamps : true
});

conceptmatrixSchema.index({ key: 1, code: 1 });

module.exports = mongoose.model('Conceptmatrix', conceptmatrixSchema);
