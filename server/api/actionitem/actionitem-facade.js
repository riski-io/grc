const Model = require('../../lib/facade');
const actionitemSchema  = require('./actionitem-schema');

class ActionitemModel extends Model {}

module.exports = new ActionitemModel(actionitemSchema);
