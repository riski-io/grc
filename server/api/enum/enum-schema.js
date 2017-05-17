"use strict";
import mongoose from 'mongoose';
const Schema   = mongoose.Schema;
const enumSchema = new Schema({
  key: {type: String, unique : true},
  title: String
}, {
	timestamps: true
});

module.exports = mongoose.model('Enum', enumSchema);
