'use strict';

var OrgUnit = require('./org-unit.model');
var User = require('../user/user.model');
var config = require('../../lib/config');
var esClient = require('../../lib/elasticsearch').client;
var _ = require('lodash');
var emailUtils = require('../util/emailUtils');
var async = require('async');

var validationError = function(res, err) {
  return res.json(422, err);
};


/**
 * @apiDefine NotFoundError
 *
 * @apiError NotFound Org Unit is not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "NotFound"
 *     }
 */

/**
 * @apiDefine NoAccessRightError
 *
 * @apiError NoAccessRight User doesn't have permission or doesn't have required org unit membership to perform the action.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "error": "NoAccessRight"
 *     }
 */

/**
 * @api {get} /api/organisation-units  - List All organisation units
 * @apiVersion 0.1.0
 *
 * @apiName GetOrganisationUnits
 * @apiGroup Organisation Units
 * @apiPermission member/admin/magager
 *
 * @apiDescription List All organisation units
 *
 *
 * @apiExample Example usage:
 * curl -i http://localhost/api/organisation-units
 *
 * @apiSuccess {Object[]}   units                   list of units
 * @apiSuccess {String}     unit.orgUnitId           Org Unit ID
 * @apiSuccess {String}     unit.orgCode             Org Unit Code
 * @apiSuccess {String}     unit.orgName             Org Unit Name
 * @apiSuccess {String}     unit.parent              Parent Org Unit ID
 * @apiSuccess {String[]}   unit.memberList          Org Unit Members
 * @apiSuccess {String[]}   unit.managerList         Org Unit Managers
 * @apiSuccess {String[]}   unit.childList           List of child org unit Ids
 * @apiSuccess {Date}       unit.updatedAt           Last Updated Date
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 204 OK
 *
 * @apiUse NoAccessRightError
 */
exports.index = function(req, res) {
  getAllOrgUnits(req, function(err, orgUnits) {
    if (err) return res.send(500, err);
    res.json(orgUnits);
  });
};


function getAllOrgUnits(req, callback) {
  var userId = req.user.userId;
  req.query = req.query || {};
  if (req.user.role === 'admin' || req.query.all === 'true') {
    OrgUnit.find({},'-childList -members', function(err, data) {
      if (err) {
        return callback(err);
      }
      callback(null, data);
    });
  }else{
    getOrgMemberships(userId , req.user.role, function (err , orgs) {
      if (err) {
        return callback(err);
      }
      callback(null, orgs);
    });
  }
}

/**
 * @api {get} /api/organisation-units/by-user/:id'  - List all user org memberships
 * @apiVersion 0.1.0
 *
 * @apiName GetOrgMemberships
 * @apiGroup Organisation Units
 * @apiPermission member/admin/magager
 *
 * @apiParam {String}     id           User ID
 *
 * @apiDescription List all user org memberships
 *
 *
 * @apiExample Example usage:
 * curl -i http://localhost/api/organisation-units/by-user/webbek
 *
 * @apiSuccess {Object[]}   units                   list of units
 * @apiSuccess {String}     unit.orgUnitId           Org Unit ID
 * @apiSuccess {String}     unit.orgCode             Org Unit Code
 * @apiSuccess {String}     unit.orgName             Org Unit Name
 * @apiSuccess {String}     unit.parent              Parent Org Unit ID
 * @apiSuccess {String[]}   unit.memberList          Org Unit Members
 * @apiSuccess {String[]}   unit.managerList         Org Unit Managers
 * @apiSuccess {String[]}   unit.childList           List of child org unit Ids
 * @apiSuccess {Date}       unit.updatedAt           Last Updated Date
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 204 OK
 *
 * @apiUse NoAccessRightError
 */
exports.getOrgUnitByUser = function (req , res) {
  var userId = req.params.id;
  User.findById(userId, function (err , user) {
    if (err || !user) {
      return res.send(404 , new Error('User Not Found'));
    }
    user.userId = userId;

    getAllOrgUnits({user: user}, function(err, orgs) {
      if (err) return validationError(res , err);
      return res.json(orgs);
    });
  });
};


function getOrgMemberships(userId , role, includeChildOrgs, cb) {
  var query = {};
  if (role !== 'admin') {
    query = {
      'members': 
        {
          $elemMatch: 
          {
            userId: userId
          }
      }
    };
  }
  if (typeof includeChildOrgs === 'function') {
    cb = includeChildOrgs;
    includeChildOrgs = true;
  }

  var promise = null;
  if (includeChildOrgs) {
    promise = OrgUnit.find(query);
    promise = promise.populate('childList', 'orgUnitId orgName orgCode parent');
  }else{
    promise = OrgUnit.find(query, '-childList');
  }
  promise.exec(function (err, orgs) {
    if (err) return cb(err);
    var memberships = [];
    _.forEach(orgs , function (org) {
      var data = {
        orgUnitId : org.orgUnitId,
        orgCode : org.orgCode,
        orgName : org.orgName,
        parent : org.parent
      };
      var member = _.find(org.members, {'userId': userId});
      if (member) {
        data.role = member.role;
      }else{
        data.role = 'admin';
      }
      memberships.push(data);
      var orgUnits = _.keyBy(memberships, 'orgUnitId');
      memberships = _.map(memberships, function (orgUnit) {
        var parentExists = orgUnits[orgUnit.parent];
        if (!parentExists) {
          delete orgUnit.parent;
        }
        return orgUnit;
      });
      if (includeChildOrgs) {
        var childList = _.map(org.childList, function(element) { 
          return _.extend({}, element, {role: data.role});
        });
        memberships = _.concat(memberships, childList);
      }
    });
    cb(null, memberships);
  });
}

function getUsersFromMembershipOrgs(userId , cb) {
  var query = {
    'members': 
        {
          $elemMatch: 
          {
            userId: userId
          }
      }
  };
  OrgUnit.find(query)
  .populate('members.userId')
  .exec(function (err, orgs) {
    if (err) return cb(err);
    cb(null, orgs);
  });
}

exports.getChildOrgs = function(orgUnitId, callback) {
  OrgUnit.find({'ancestors.id' : {$in: orgUnitId}}, "orgName orgCode parent")
  .exec(function (err, orgs) {
    callback(err, orgs);
  });
};


exports.getOrgTree = function(orgUnits, callback){
  function buildTree(array, parent, tree) {
    tree = typeof tree !== 'undefined' ? tree : [];
    parent = typeof parent !== 'undefined' ? parent : {
      orgUnitId: undefined
    };
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
  }

  if (orgUnits) {
    return callback(buildTree(orgUnits));
  }
  callback();
};

/**
 * @api {put} /api/organisation-units/:id'  - Update Org Unit
 * @apiVersion 0.1.0
 *
 * @apiName UpdateOrgMemberships
 * @apiGroup Organisation Units
 * @apiPermission admin/magager
 *
 * @apiParam {String}     orgUnitId           Org Unit ID
 * @apiParam {String}     orgCode             Org Unit Code
 * @apiParam {String}     orgName             Org Unit Name
 * @apiParam {String}     parent              Parent Org Unit ID
 * @apiParam {String[]}   memberList          Org Unit Members
 * @apiParam {String[]}   managerList         Org Unit Managers
 * @apiParam {String[]}   childList           List of child org unit Ids
 * @apiParam {Date}       updatedAt           Last Updated Date
 *
 * @apiDescription List all user org memberships
 *
 *
 * @apiExample Example usage:
 * curl -i http://localhost/api/organisation-units/97s96s986s9yshskhsiytsut
 *
 * @apiSuccess {String}     orgUnitId           Org Unit ID
 * @apiSuccess {String}     orgCode             Org Unit Code
 * @apiSuccess {String}     orgName             Org Unit Name
 * @apiSuccess {String}     parent              Parent Org Unit ID
 * @apiSuccess {String[]}   memberList          Org Unit Members
 * @apiSuccess {String[]}   managerList         Org Unit Managers
 * @apiSuccess {String[]}   childList           List of child org unit Ids
 * @apiSuccess {Date}       updatedAt           Last Updated Date
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 204 OK
 *
 * @apiUse NoAccessRightError
 * @apiUse NotFoundError
 */

exports.update = function(req, res, next) {
  var json = req.body;
  delete json.orgUnitId;
  var orgUnitId = req.params.orgUnitId;
  OrgUnit.update({
    _id: orgUnitId
  }, json, function(err, data) {
    if (err || !data) {
      return validationError(res, err);
    }
    res.json(200, data);
  });
};

exports.changeRole = function (req, res, next) {
  var userId = req.params.userId;
  var orgUnitId = req.params.orgUnitId;
  var oldRole = req.body.oldRole;
  var newRole = req.body.newRole;

  if (!oldRole || !newRole) {
    return validationError(res, new Error('Old and New role are required'));
  }
  OrgUnit.findOne({'orgUnitId' : orgUnitId} , function (err, orgUnit) {
    if (err && !orgUnit) {
      return validationError(res, new Error('Org Unit not found'));
    }
    var index = _.findIndex(orgUnit.members, function(user) {
      return user.userId === userId;
    });
    if (index > 0) {
      orgUnit.members[index].ole = newRole;
    }else{
      return validationError(res, new Error('User is not a memeber of the org unit'));
    }
    orgUnit.save(function(err, data) {
      if (err || !data) {
        return validationError(res, err);
      }
      res.json(200);
    });
  });
};

/**
 * remove user
 * Restriction 'Admin'
 */
exports.removeUser = function(req, res, next) {
  var userId = req.params.userId;
  var orgUnitId = req.params.orgUnitId;
  var role = req.params.role;

  OrgUnit.findOne({'orgUnitId' : orgUnitId} , function (err, orgUnit) {
  //OrgUnit.get(query, function(err, orgUnit) {
    if (err && !orgUnit) {
      return validationError(res, new Error('Org Unit not found'));
    }

    orgUnit.members = _.filter(orgUnit.members, function (user) {
      return user.userId !== userId;
    });
    orgUnit.save(function(err, data) {
      if (err || !data) {
        return validationError(res, err);
      }
      User.findById(userId, function (err , recipient) {
        if (!err && recipient) {
          emailUtils.send([userId], 'user.deregistration', {changedBy : req.user , recipient : recipient, organisationUnit : orgUnit}, function(err) {
            console.log('send emails for user.deregistration', err);
          });
        }
      });
      res.json(204);
    });
  });
};


/**
 * @api {post} /api/organisation-units'  - Create an Org Unit
 * @apiVersion 0.1.0
 *
 * @apiName CreateOrgUnit
 * @apiGroup Organisation Units
 * @apiPermission admin
 *
 * @apiParam {String}     orgUnitId           Org Unit ID
 * @apiParam {String}     orgCode             Org Unit Code
 * @apiParam {String}     orgName             Org Unit Name
 * @apiParam {String}     parent              Parent Org Unit ID
 * @apiParam {String[]}   memberList          Org Unit Members
 * @apiParam {String[]}   managerList         Org Unit Managers
 * @apiParam {String[]}   childList           List of child org unit Ids
 * @apiParam {Date}       updatedAt           Last Updated Date
 *
 * @apiDescription Create an Org Unit
 *
 *
 * @apiExample Example usage:
 * curl -i http://localhost/api/organisation-units
 *
 * @apiSuccess {String}     orgUnitId           Org Unit ID
 * @apiSuccess {String}     orgCode             Org Unit Code
 * @apiSuccess {String}     orgName             Org Unit Name
 * @apiSuccess {String}     parent              Parent Org Unit ID
 * @apiSuccess {String[]}   memberList          Org Unit Members
 * @apiSuccess {String[]}   managerList         Org Unit Managers
 * @apiSuccess {String[]}   childList           List of child org unit Ids
 * @apiSuccess {Date}       updatedAt           Last Updated Date
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 204 OK
 *
 * @apiUse NoAccessRightError
 */
exports.create = function(req, res) {
  var json = req.body;
  if (!json.orgName) {
    return validationError(res, new Error('orgName is not specified'));
  }
  var orgUnit = new OrgUnit(json);
  orgUnit.save(function(err, data) {
    if (err || !data) {
      return validationError(res, err);
    }
    res.json(200, data);
  });
};


/**
 * @api {get} /api/organisation-units/:id'  - Get org unit details
 * @apiVersion 0.1.0
 *
 * @apiName GetOrgUnitDetails
 * @apiGroup Organisation Units
 * @apiPermission member/admin/magager
 *
 * @apiParam {String}     orgUnitId           Org Unit ID
 *
 * @apiDescription Get org unit details
 *
 *
 * @apiExample Example usage:
 * curl -i http://localhost/api/organisation-units/97s96s986s9yshskhsiytsut
 *
 * @apiSuccess {String}     orgUnitId           Org Unit ID
 * @apiSuccess {String}     orgCode             Org Unit Code
 * @apiSuccess {String}     orgName             Org Unit Name
 * @apiSuccess {String}     parent              Parent Org Unit ID
 * @apiSuccess {String[]}   memberList          Org Unit Members
 * @apiSuccess {String[]}   managerList         Org Unit Managers
 * @apiSuccess {String[]}   childList           List of child org unit Ids
 * @apiSuccess {Date}       updatedAt           Last Updated Date
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 204 OK
 *
 * @apiUse NoAccessRightError
 * @apiUse NotFoundError
 */
exports.show = function(req, res, next) {
  var orgUnitId = req.params.orgUnitId;
  if (!orgUnitId) {
    return validationError(res, new Error('orgUnitId is not specified'));
  }
  OrgUnit.findById(orgUnitId)
  .populate('members.userId childList')
  .exec(function(err, orgUnit) {
    if (err) return res.send(500, err);
    if (!orgUnit) return res.send(401, err);
    return res.json(orgUnit);
  });
};


/**
 * Deletes a OrgUnit
 * restriction: 'user'
 */
exports.destroy = function(req, res) {
  if (!req.params.orgUnitId) {
    return validationError(res, new Error('orgUnitId is not specified'));
  }
  OrgUnit.remove({
    _id: req.params.orgUnitId
  }, function(err) {
    if (err) {
      return res.send(401, err);
    }
    return res.send(204);
  });
};


exports.getOrgMemberships = getOrgMemberships;
exports.getUsersFromMembershipOrgs = getUsersFromMembershipOrgs;