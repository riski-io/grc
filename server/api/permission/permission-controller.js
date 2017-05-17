import _ from 'lodash';
const Controller = require('../../lib/controller');
const Auth = require('../../auth/auth.service');
const Permission  = require('./permission-schema');


class PermissionController extends Controller {
	getPermissionsForRole (req , res) {
	  let role = req.user.role;
	  const list = req.query.list; 

	  if (role === 'user') {
	    role = 'member';
	  }
	  var permission = {}; 
	  Permission.find({}, function(err, data) {
	    if (err) {
	      return res.send(500, err);
	    }
	    if (list && role === 'admin') {
	    	return res.json(data);
	    }
	    _.forEach(data , function (page) {
	      permission[page.key] = page.roles[role];
	    });
	    res.json(permission);
	  });
	}
}

module.exports = new PermissionController(Permission);
