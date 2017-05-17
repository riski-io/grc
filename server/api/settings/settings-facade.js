const Model = require('../../lib/facade');
const settingsSchema  = require('./settings-schema');

class SettingsModel extends Model {}

module.exports = new SettingsModel(settingsSchema);
