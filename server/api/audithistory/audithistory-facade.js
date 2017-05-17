const Model = require('../../lib/facade');
const historySchema  = require('./audithistory-schema');

class HistoryModel extends Model {}

module.exports = new HistoryModel(historySchema);
