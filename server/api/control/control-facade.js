const Model = require('../../lib/facade');
const controlSchema  = require('./control-schema');

class ControlModel extends Model {}

module.exports = new ControlModel(controlSchema);
