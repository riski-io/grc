import mongoose from 'mongoose';
import _ from 'lodash';
const Schema   = mongoose.Schema;


const settingsSchema = new Schema({
  key: {
    type: String,
    index: true
  },
  value: String,
  name: String,
  description: String
},{
  timestamps : true
});

const Settings = mongoose.model('Settings', settingsSchema);

_.extend(Settings, {
  getAllSettings: function(cb) {
    cb = cb || _.noop;
    Settings.find({}, function(err, items) {
      if (err) {
        return cb(err);
      }
      cb(null, _.mapValues(_.keyBy(items, 'key'),  function(o){return o.value;}));
    });
  }
});

module.exports = Settings
