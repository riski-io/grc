import mongoose from 'mongoose';
const Schema   = mongoose.Schema;

const permissionSchema = new Schema({
  key: {
    type: String,
    index: true
  },
  title: String,
  roles: Object
},{
  timestamps : true
});


module.exports = mongoose.model('Permission', permissionSchema);
