import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const historySchema = new Schema({
  refEntityId: {type: String,index: true},
  refEntityType : {type : String},
  version : Number,
  changedBy : { type: String, ref: 'User', index : true},
  changeList : {type : Schema.Types.Mixed},
  snapshot : {type : Object}
},{
  timestamps : true
});

module.exports = mongoose.model('AuditHistory', historySchema);
