'use strict';

var User = require('./user.model');
var config = require('../../lib/config');
var jwt = require('jsonwebtoken');
var OrgUnit = require('../organisation-unit/org-unit.model');
var _ = require('lodash');
var async = require('async');
var OrgUnitCtrl = require('../organisation-unit/org-unit.controller');
var ReviewCtrl = require('../review/review-controller');
var RecordCtrl = require('../governancerecord/governancerecord-controller');
var ActionCtrl = require('../actionitem/actionitem-controller');
var ControlCtrl = require('../control/control-controller');

var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * @apiDefine UserNotFoundError
 *
 * @apiError UserNotFound The id of the User was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UserNotFound"
 *     }
 */

/**
 * @api {get} /api/users  - List All users
 * @apiVersion 0.1.0
 *
 * @apiName GetUsers
 * @apiGroup User
 * @apiPermission admin/magager
 *
 * @apiDescription List all users under the users org units
 *
 *
 * @apiExample Example usage:
 * curl -i http://localhost/api/users
 *
 * @apiSuccess {Object[]} users            list of users
 * @apiSuccess {String}   user.userId            The Users-ID.
 * @apiSuccess {String}   user.givenName         Given Name of the User.
 * @apiSuccess {String}   user.familyName        Family Name of the User.
 * @apiSuccess {String}   user.email             Email.
 * @apiSuccess {String}   user.role              User Role.
 * @apiSuccess {Date}     user.lastLoggedInAt    Last LoggedIn time
 * @apiSuccess {Date}     user.createdAt       User registration date 
 * @apiSuccess {Date}     user.updatedAt         User updated date
 *
 * @apiError NoAccessRight Only authenticated Users can access the data.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *       "error": "NoAccessRight"
 *     }
 */

exports.index = function(req, res) {
  var userId = req.user.userId;
  if (req.user.role !== 'admin') {
    OrgUnitCtrl.getUsersFromMembershipOrgs(userId , function (err , orgs) {
      var userIds = [];
      _.forEach(orgs , function (org) {
        userIds = _.concat(userIds, _.map(org.members, 'userId'));
      });
      userIds = _.uniq(userIds);
      User.find({
        _id : {
          $in : userIds
        }
      }, '-lastLoggedInAt -updatedAt -createdAt')
      .exec(function (err , users) {
        if(err) return res.send(500, err);
        res.json(200, users);
      });
    });
  }else{
    User.findAll(function (err, users) {
      if(err) return res.status(403).send(new Error('Users Access Error'));
      res.status(200).json(users);
    });
  }
};

/**
 * @api {get} /api/users/get-all-admins  - List All admin users
 * @apiVersion 0.1.0
 *
 * @apiName getAdminUsers
 * @apiGroup User
 * @apiPermission admin
 *
 * @apiDescription List all Admins
 *
 *
 * @apiExample Example usage:
 * curl -i http://localhost/api/users/getAdminUsers
 *
 * @apiSuccess {Object[]} users            list of users.
 * @apiSuccess {String}   user.userId            The Users-ID.
 * @apiSuccess {String}   user.givenName         Given Name of the User.
 * @apiSuccess {String}   user.familyName        Family Name of the User.
 * @apiSuccess {String}   user.email             Email.
 * @apiSuccess {String}   user.role              User Role.
 * @apiSuccess {Date}     user.lastLoggedInAt    Last LoggedIn time
 * @apiSuccess {Date}     user.createdAt       User registration date 
 * @apiSuccess {Date}     user.updatedAt         User updated date
 *
 * @apiError NoAccessRight Only authenticated Users can access the data.
 * @apiError UserNotFound   The <code>id</code> of the User was not found.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "UserNotFound"
 *     }
 */
exports.getAdminUsers = function  (req, res) {
  User.find({role : 'admin'}, function  (err, users) {
    if (err) {
      return res.send(404, new Error('UserNotFound'));
    }
    res.send(users);
  });
};


/**
 * @api {post} /api/users  - Register a new User
 * @apiVersion 0.1.0
 * @apiName PostUser
 * @apiGroup User
 * @apiPermission admin/magage/member
 *
 * @apiDescription In this case "apiErrorStructure" is defined and used.
 * Define blocks with params that will be used in several functions, so you dont have to rewrite them.
 *
 * @apiParam {String}   userId            The Users-ID.
 * @apiParam {String}   givenName         Given Name of the User.
 * @apiParam {String}   familyName        Family Name of the User.
 * @apiParam {String}   email             Email.
 * @apiParam {String}   role              User Role.
 *
 * @apiSuccess {String} token         Json web token with user data encripted.
 * @apiError CreateUserError   Error in user registration.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 422 Not Found
 *     {
 *       "error": "CreateUserError"
 *     }
 */

exports.create = function (req, res, next) {
  var newUser = req.body;
  newUser.role = newUser.role || 'member';
  User.findOrCreate(newUser , function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });
  });
};


/**
 * @api {get} /api/users/search/:name  - Search Active Directory Uers
 * @apiVersion 0.1.0
 *
 * @apiName searchUsers
 * @apiGroup User
 * @apiPermission admin/magager
 *
 * @apiDescription get all users with familyName starting with "name"
 *
 *
 * @apiExample Example usage:
 * curl -i http://localhost/api/users/search/kum
 * @apiSuccess {Object[]}   users            list of users
 * @apiSuccess {String}   user.userId            The Users-ID.
 * @apiSuccess {String}   user.givenName         Given Name of the User.
 * @apiSuccess {String}   user.familyName        Family Name of the User.
 * @apiSuccess {String}   user.email             Email.
 * @apiSuccess {String}   user.role              User Role.
 * @apiSuccess {Date}     user.lastLoggedInAt    Last LoggedIn time
 * @apiSuccess {Date}     user.createdAt       User registration date 
 * @apiSuccess {Date}     user.updatedAt         User updated date
 *
 * @apiError NoAccessRight Only authenticated Users can access the data.
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *       "error": "NoAccessRight"
 *     }
 */

exports.search = function (req, res) {
  var name = req.params.name;
  User.find({name : { "$regex": name, "$options": "i" }} , function (err, users) {
    if (err) {
      return res.send(500 , new Error(err));
    }
    users = users || [];
    users = _.filter(users, function(user) {
      return user.email ? true : false;
    });
    res.send(users);
  });
};

/**
 * @api {put} /api/users/:id  - Modify User Role
 * @apiVersion 0.1.0
 *
 * @apiName UpdateUserRole
 * @apiGroup User
 *
 * @apiParam {String} id          User's unique ID.
 * @apiParam {String} [role] User's Role.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *
 * @apiUse UserNotFoundError
 */

exports.updateRole = function (req, res, next) {
  var userId = req.body.userId;
  var role = req.body.role;
  var defaultOrgUnit = req.body.defaultOrgUnit;
  if (role === 'admin' && req.user.role !== 'admin') {
    return res.send(403);
  }
  userId = userId.toLowerCase();
  User.findOne({userId : userId} , function (err , user) {
    if (err  || !user) {
      return res.send(404 , "Not Found");
    }
    if (defaultOrgUnit) {
      user.defaultOrgUnit = defaultOrgUnit;
    }
    if (role === 'member' || role === 'manager' || role === 'admin') {
      user.role = role;
      user.save(function (err) {
          if (err) {
            return res.send(404 , "Not Found");
          }else{
            res.send(user);
          }
      });
    }else{
      res.send(403);
    }
  });
};


/**
 * @api {get} /api/users/:id  - Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id Users unique ID.
 *
 * @apiSuccess {String}   userId            The Users-ID.
 * @apiSuccess {String}   givenName         Given Name of the User.
 * @apiSuccess {String}   familyName        Family Name of the User.
 * @apiSuccess {String}   email             Email.
 * @apiSuccess {String}   role              User Role.
 * @apiSuccess {Date}     lastLoggedInAt    Last LoggedIn time
 * @apiSuccess {Date}     createdAt       User registration date 
 * @apiSuccess {Date}     updatedAt         User updated date
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
         "userId" : "johnd"
         "role" : "manager"
 *       "givenName": "John",
 *       "familyName": "Doe"
 *     }
 *
 * @apiUse UserNotFoundError
 */

exports.show = function (req, res, next) {
  var id = req.params.id;
  var userId = req.user.userId;
  if (req.user.role === 'admin') {
    User.findOne({
      _id: (req.params.id || "").toLowerCase()
    }, function(err, user) {
      if (err) return validationError(res , new Error('Error in fetching user'));
      if (!user) return res.send(404 , new Error('User not fount'));
      res.json(user);
    });
  }else{
    OrgUnitCtrl.getUsersFromMembershipOrgs(userId , function (err , orgs) {
      var userArray = [];
      _.forEach(orgs , function (org) {
        userArray = _.concat(userArray, _.map(org.members, 'userId'));
      });
      userArray = _.uniq(userArray);
      if (_.includes(userArray , userId)) {
        User.findById(id, function(err, user) {
          if (err) return validationError(res , new Error('Error in fetching user'));
          if (!user) return res.send(404 , new Error('User not fount'));
          res.json(user);
        });
      }else{
        res.send(403);
      }
    });
  }
};

/**
 * @api {delete} /api/users/:id  - Delete a User
 * @apiName DeleteUser
 * @apiGroup User
 * @apiPermission admin
 *
 * @apiParam {String} id          User's unique ID.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 204 OK
 *
 * @apiUse UserNotFoundError
 */
exports.destroy = function(req, res) {
  User.remove({
    _id: (req.params.id || "").toLowerCase()
  }, function(err) {
    if (err) {
      return res.send(401, new Error('Error in deleting the user'));
    }
    return res.send(204);
  });
};



/**
 * @api {get} /api/users/me  - Request logged in user information
 * @apiName GetUser
 * @apiGroup User
 *
 *
 * @apiSuccess {String}   userId            The Users-ID.
 * @apiSuccess {String}   givenName         Given Name of the User.
 * @apiSuccess {String}   familyName        Family Name of the User.
 * @apiSuccess {String}   email             Email.
 * @apiSuccess {String}   role              User Role.
 * @apiSuccess {Date}     lastLoggedInAt    Last LoggedIn time
 * @apiSuccess {Date}     createdAt       User registration date 
 * @apiSuccess {Date}     updatedAt         User updated date
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
         "userId" : "johnd"
         "role" : "manager"
 *       "givenName": "John",
 *       "familyName": "Doe"
 *     }
 *
 * @apiUse UserNotFoundError
 */

exports.me = function(req, res, next) {
  var userId = req.user.userId;
  User.findById(userId.toLowerCase(),function(err, user) { // don't ever give out the password or salt
    if (err) return validationError(res , new Error('Error in fetching user'));
    if (!user) return res.send(404 , new Error('User not fount'));
    res.json(User.getSafeJSON(user));
  });
};


/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};

var buildTree = function (array, parent, tree) {
  tree = typeof tree !== 'undefined' ? tree : [];
  parent = typeof parent !== 'undefined' ? parent : {orgUnitId: undefined};
  var children = _.filter(array, function(child) {
    return child.parent === parent.orgUnitId;
  });
  if (!_.isEmpty(children)) {
    if (!parent.orgUnitId) {
      tree = children;
    } else {
      parent.items = children || [];
    }
    _.each(children, function(child) {
      buildTree(array, child);
    });
  } else {
    parent.items = [];
  }
  return tree;
};

function getDetails (userId , req , res) {
  User.findById(userId.toLowerCase(), function(err, user) {
    if (err) return validationError(res , new Error("User doesn't exists"));
    if (!user) return validationError(res , new Error("User doesn't exists"));
    var json = _.cloneDeep(user);
    async.parallel([
        function(callback){ 
          OrgUnitCtrl.getOrgMemberships(userId , user.role, false, function (err , orgs) {
            json.orgMemberships = orgs;
            //json.orgTree = buildTree(orgs);
            callback(err , orgs);
          }, user.role);
        },
        function(callback){ 
          ReviewCtrl.getReviewsByUser(userId , function (err , reviews) {
            json.reviews = reviews;
            callback(err , reviews);
          });
        },
        function(callback){ 
          RecordCtrl.getRecordsByUser(userId , function (err , records) {
            json.records = records;
            callback(err , records);
          });
        },
        function(callback){ 
          ActionCtrl.getActionItemsByUser(userId , function (err , actionItems) {
            json.actionItems = actionItems;
            callback(err , actionItems);
          });
        },
        function(callback){ 
          ControlCtrl.gerControlsByUser(userId , function (err , controls) {
            json.controls = controls;
            callback(err , controls);
          });
        }
    ], function (err , results) {
      if (err) return res.json(user);
      res.json(json);
    });
  });
}


exports.getUserDetails = function (req , res) {
  var userId = req.params.id;
  if (userId === req.user.userId || req.user.role === 'admin') {
    return getDetails(userId , req , res);
  }
  OrgUnitCtrl.getUsersFromMembershipOrgs(userId , function (err , orgs) {
      var userArray = [];
      _.forEach(orgs , function (org) {
        userArray = _.concat(userArray, _.map(org.members, 'userid'));
      });
      userArray = _.uniq(userArray);
    if (_.includes(userArray , userId)) {
      getDetails(userId , req , res);
    }else{
      res.send(403);
    }
  });
};