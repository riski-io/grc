const Model = require('../../lib/facade');
const governancerecordSchema  = require('./governancerecord-schema');

class GovernancerecordModel extends Model {}

module.exports = new GovernancerecordModel(governancerecordSchema);
