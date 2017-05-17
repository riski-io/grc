const Model = require('../../lib/facade');
const permissionSchema  = require('./permission-schema');

class PermissionModel extends Model {}

module.exports = new PermissionModel(permissionSchema);
