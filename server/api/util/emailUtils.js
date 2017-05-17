'use strict';


var email = require('../../lib/email');
var config = require('../../lib/config');
var logger = require('../../lib/logger');
var Settings = require('../settings/settings-schema');
var Template = require('../emailtemplate/emailtemplate-schema');
var User = require('../user/user.model');
var handlebars = require('handlebars');
var _ = require('lodash');
var async = require('async');
var normalizeUrl = require('normalize-url');
var GovernanceRecord = require('../governancerecord/governancerecord-schema');
var OrgUnit = require('../organisation-unit/org-unit.model');
var path = require('path');
var templatePath = path.normalize(__dirname + '/../audithistory/templates/');
require('./handlebarsHelpers')(handlebars);
var auditHistoryFormat = require('../audithistory/audithistory-controller').format;
var fs = require('fs');
var moment = require('moment');

String.prototype.contains = function(it) {
  return this.indexOf(it) !== -1;
};

function getUsersInfo(userIds, cb) {
  if (userIds && !_.isArray(userIds)) {
    userIds = [userIds];
  }
  userIds = _.map(userIds, function (item) {
    if (_.isObject(item)) {
      return item._id;
    }else{
      return item;
    }
  });
  userIds = _.compact(userIds);
  User.find({
    _id : {
      $in : userIds
    }
  }).exec(function(err, data) {
    if (err) {
      logger.error(err);
    }
    cb(err, data);
  });
}

/**
 * Find email template, resolve user emails from userIds and send emails
 * @param {Array} userIds
 * @param {String} templateKey
 * @param {Object} data
 * @param {Function} callback
 */
exports.send = function(userIds, userEmailsCC, templateKey, baseData, callback) {
  Settings.getAllSettings(function(err, settings) {
    if (err) {
      return callback(err);
    }
    Template.findOne({key : templateKey}).exec(function(err, template) {
      if (err) {
        return callback(err);
      }
      if (!template) {
        return callback(new Error('Template with key "' + templateKey + '" not found'));
      }
      var templateRenderer;
      var subjectRenderer;
      try {
        templateRenderer = handlebars.compile(template.body);
        subjectRenderer = handlebars.compile(template.subject);
      } catch (e) {
        return callback(e);
      }
      getUsersInfo(userIds, function(err, users) {
        if (err) {
          return callback(err);
        }
        var emails = _.chain(_.cloneDeep(users)).map(function(user) {
          return user.email;
        }).join(', ').value();
        console.log('Sending email to: ', emails);
        var ccEmails = '';
        if (userEmailsCC && userEmailsCC.length) {
          ccEmails = userEmailsCC.join(', ');
        }
        getTemplateData(templateKey, baseData, settings, function(data) {
          async.each(users, function(user, cb) {
            var templateData = _.extend({}, {recipient: user}, data);
            var bodyStr = '';
            var subjectStr = '';
            try {
              bodyStr = templateRenderer(templateData);
              subjectStr = subjectRenderer(templateData);
            } catch (e) {
              return cb(e);
            }
            var mailOptions = {
              from: settings.email_address,
              to: '<' + user.email + '>',
              subject: subjectStr,
              html: bodyStr
            };
            if (ccEmails) {
              mailOptions.cc = ccEmails;
            }
            email.sendMail(mailOptions, cb);
          }, function(err) {
            callback(err);
          });
        });
      });

    }, function(err) {
      console.log('err', err);
      callback(err);
    });
  });
};

var variableSampleData = {
  review: {
    'reviewId': "",
    'title': '',
    'scheduledBy': {
      'userId': '',
      'givenName': '',
      'familyName': '',
      'email': '',
      'role': ''
    },
    'scheduleType': '',
    'reviewType': '',
    'status': '',
    'description': '',
    'createdAt': '',
    'updatedAt': '',
    'URL': '',
    'AuditHistory': {
      'refEntityId': '',
      'historyId': '',
      'version': 8,
      'changedBy': {
        'userId': '',
        'givenName': '',
        'familyName': '',
        'email': '',
        'role': ''
      },
      'text': ''
    }
  },
  actionItem: {
    'actionItemId': '',
    'refEntityId': '',
    'refEntityType': '',
    'assignedTo': {
      'userId': '',
      'givenName': '',
      'familyName': '',
      'email': '',
      'role': ''
    },
    'createdBy': {
      'userId': '',
      'givenName': '',
      'familyName': '',
      'email': '',
      'role': ''
    },
    'title': '',
    'description': '',
    'actionRequired': '',
    'status': '',
    'priority': '',
    'percentComplete': 76,
    'createdAt': '',
    'dueDate': '',
    'updatedAt': '',
    'URL': '',
    'AuditHistory': {
      'refEntityId': '',
      'historyId': '',
      'version': 8,
      'changedBy': {
        'userId': '',
        'givenName': '',
        'familyName': '',
        'email': '',
        'role': ''
      },
      'text': '',
    }
  },
  record: {
    'recordId': '',
    'title': '',
    'status': '',
    'description': '',
    'responsibleOrg': {
      '_id': '',
      'orgCode': '',
      'orgName': ''
    },
    'overallAssessment': {
      'initialRating': 2,
      'initialCost': 500,
      'controlledRating': 2,
      'controlledCost': 500,
      'targetRating': 2,
      'targetCost': 500
    },
    'URL': '',
    'AuditHistory': {
      'refEntityId': '',
      'historyId': '',
      'version': 8,
      'changedBy': {
        'userId': '',
        'givenName': '',
        'familyName': '',
        'email': '',
        'role': ''
      },
      'text': '',
      'createdAt': '',
      'updatedAt': ''
    }
  },
  control: {
    'controlId': '',
    'title': '',
    'status': '',
    'responsibleOrg': {
      '_id': '',
      'orgCode': '',
      'orgName': ''
    },
    'responsibleUser': {
      '_id': '',
      'givenName': '',
      'familyName': '',
      'email': '',
      'role': ''
    },
    'description': '',
    'URL': '',
    'AuditHistory': {
      'refEntityId': '',
      '_id': '',
      'version': 8,
      'changedBy': {
        'userId': '',
        'givenName': '',
        'familyName': '',
        'email': '',
        'role': ''
      },
      'text': '',
      'createdAt': '',
      'updatedAt': ''
    }
  },
  organisationUnit: {
    'orgUnitId': '',
    'orgCode': '',
    'orgName': ''
  },
  invitation: {
    'invitationId': '',
    'assignedRole' : '',
    'URL': ''
  },
  entity: {
    'id': '',
    'title': ''
  },
  comment: {
    text: '',
    postedBy: {
      'userId': '',
      'givenName': '',
      'familyName': '',
      'email': '',
      'role': ''
    }
  },
  user: {
    'userId': '',
    'givenName': '',
    'familyName': '',
    'email': '',
    'role': ''
  },
  changedBy: {
    'userId': '',
    'givenName': '',
    'familyName': '',
    'email': '',
    'role': ''
  },
  approver: {
    'userId': '',
    'givenName': '',
    'familyName': '',
    'email': '',
    'role': ''
  },
  requestor: {
    'userId': '',
    'givenName': '',
    'familyName': '',
    'email': '',
    'role': ''
  },
  recipient: {
    'userId': '',
    'givenName': '',
    'familyName': '',
    'email': '',
    'role': ''
  }
};

var templates = {
  'review.scheduled': ['review', 'recipient'],
  'review.updated': ['review', 'recipient'],
  'record.identified': ['record', 'recipient'],
  'record.updated': ['record', 'recipient'],
  'control.new': ['control', 'recipient'],
  'control.updated': ['control', 'recipient'],
  'actionItem.new': ['actionItem', 'recipient'],
  'actionItem.updated': ['actionItem', 'recipient'],
  'user.registration': ['invitation', 'recipient', 'user', 'organisationUnit'],
  'member.confirmation': ['user', 'organisationUnit', 'recipient', 'invitation'],
  'member.rolechange': ['user', 'user.oldRole', 'organisationUnit', 'recipient'],
  'membership.request': ['requestor', 'requestURL', 'organisationUnit', 'approver'],
  'user.deregistration': ['changedBy', 'recipient', 'organisationUnit'],
  'comment.new': ['entity', 'comment', 'recipient']
};

var templateStyles = fs.readFileSync(templatePath + 'template-styles.css');
var styleBlock = '<style type="text/css">' + templateStyles.toString() + '</style>';

var reviewTemplate = fs.readFileSync(templatePath + 'review.hbs');
var reviewTemplateRenderer = handlebars.compile(styleBlock + reviewTemplate.toString());
var recordTemplate = fs.readFileSync(templatePath + 'governance-record.hbs');

var recordTemplateRenderer = handlebars.compile(styleBlock + recordTemplate.toString());
var actionItemTemplate = fs.readFileSync(templatePath + 'action-item.hbs');

var actionItemTemplateRenderer = handlebars.compile(styleBlock + actionItemTemplate.toString());
var controlTemplate = fs.readFileSync(templatePath + 'control.hbs');

var controlTemplateRenderer = handlebars.compile(styleBlock + controlTemplate.toString());

var templateDataResolvers = {};

templateDataResolvers.review = function(baseItem, settings, cb) {
  var data = _.extend({}, baseItem);
  async.parallel([
    function(cb) {
      templateDataResolvers.user(baseItem.scheduledBy, settings, function(err, user) {
        data.scheduledBy = user;
        cb();
      });
    }, function(cb) {
      if (baseItem.AuditHistory) {
        try {
          var historyItem = _.cloneDeep(baseItem.AuditHistory);
          historyItem.changes = auditHistoryFormat(baseItem.AuditHistory.snapshot, baseItem.AuditHistory.changeList);
          historyItem.text = reviewTemplateRenderer({AuditHistory: historyItem});
          if (baseItem.AuditHistory.createdAt) {
            historyItem.createdAt = moment(baseItem.AuditHistory.createdAt).format('LLL');
          }
          data.AuditHistory = historyItem;
        } catch (e) {
          console.log(e);
        }
        cb();
      } else {
        cb();
      }
    }
  ], function(err) {
    data.reviewId = data._id;
    data.URL = normalizeUrl(settings.site_url + '/review/' + data.reviewId);
    cb(err, data);
  });
};

templateDataResolvers.invitation = function(baseItem, settings, cb) {
  baseItem.URL = normalizeUrl(settings.site_url + '/org-invitation/' + baseItem._id);
  baseItem.invitationId = baseItem._id;
  baseItem.assignedRole = baseItem.assignedRole;
  cb(null, baseItem);
};

templateDataResolvers.record = function(baseItem, settings, cb) {
  var data = _.extend({}, baseItem);
  async.parallel([
    function(cb) {
      templateDataResolvers.organisationUnit(baseItem.responsibleOrg, settings, function(err, orgUnit) {
        data.responsibleOrg = orgUnit;
        cb();
      });
    },
    function(cb) {
      templateDataResolvers.user(baseItem.nominatedReviewer, settings, function(err, user) {
        data.nominatedReviewer = user;
        cb();
      });
    },
    function(cb) {
      templateDataResolvers.user(baseItem.responsibleUser, settings, function(err, user) {
        data.responsibleUser = user;
        cb();
      });
    }, function(cb) {
      if (baseItem.AuditHistory) {
        try {
          var historyItem = _.cloneDeep(baseItem.AuditHistory);
          historyItem.changes = auditHistoryFormat(baseItem.AuditHistory.snapshot, baseItem.AuditHistory.changeList);
          historyItem.text = recordTemplateRenderer({AuditHistory: historyItem});
          if (baseItem.AuditHistory.createdAt) {
            historyItem.createdAt = moment(baseItem.AuditHistory.createdAt).format('LLL');
          }
          data.AuditHistory = historyItem;
        } catch (e) {
          console.log(e);
        }
        cb();
      } else {
        cb();
      }
    }
  ], function(err) {
    data.URL = normalizeUrl(settings.site_url + '/governance-record/' + baseItem._id);
    data.recordId = baseItem._id;
    cb(err, data);
  });
};

templateDataResolvers.actionItem = function(baseItem, settings, cb) {
  var data = _.extend({}, baseItem);
  async.parallel([
    function(cb) {
      templateDataResolvers.user(baseItem.createdBy, settings, function(err, user) {
        data.createdBy = user;
        cb();
      });
    },
    function(cb) {
      templateDataResolvers.user(baseItem.assignedTo, settings, function(err, user) {
        data.assignedTo = user;
        cb();
      });
    },
    function(cb) {
      if (_.isEmpty(baseItem.governanceRecord)) {
        data.governanceRecord = {};
        return cb();
      }
      GovernanceRecord.findById(baseItem.governanceRecord, function(err, record) {
        templateDataResolvers.record(record, function(err, governanceRecord) {
          data.governanceRecord = governanceRecord;
          cb();
        });
      });
    }, function(cb) {
      if (baseItem.AuditHistory) {
        try {
          var historyItem = _.cloneDeep(baseItem.AuditHistory);
          historyItem.changes = auditHistoryFormat(baseItem.AuditHistory.snapshot, baseItem.AuditHistory.changeList);
          historyItem.text = actionItemTemplateRenderer({AuditHistory: historyItem});
          if (baseItem.AuditHistory.createdAt) {
            historyItem.createdAt = moment(baseItem.AuditHistory.createdAt).format('LLL');
          }
          data.AuditHistory = historyItem;
        } catch (e) {
          console.log(e);
        }
        cb();
      } else {
        cb();
      }
    }
  ], function(err) {
    data.actionItemId = baseItem._id;
    data.URL = normalizeUrl(settings.site_url + '/action-item/' + data.actionItemId);
    cb(err, data);
  });
};

templateDataResolvers.control = function(baseItem, settings, cb) {
  var data = _.extend({}, baseItem);
  async.parallel([
    function(cb) {
      templateDataResolvers.organisationUnit(baseItem.responsibleOrg, settings, function(err, orgUnit) {
        data.responsibleOrg = orgUnit;
        cb();
      });
    },
    function(cb) {
      templateDataResolvers.user(baseItem.responsibleUser, settings, function(err, user) {
        data.responsibleUser = user;
        cb();
      });
    }, function(cb) {
      if (baseItem.AuditHistory) {
        try {
          var historyItem = _.cloneDeep(baseItem.AuditHistory);
          historyItem.changes = auditHistoryFormat(baseItem.AuditHistory.snapshot, baseItem.AuditHistory.changeList);
          historyItem.text = controlTemplateRenderer({AuditHistory: historyItem});
          if (baseItem.AuditHistory.createdAt) {
            historyItem.createdAt = moment(baseItem.AuditHistory.createdAt).format('LLL');
          }
          data.AuditHistory = historyItem;
        } catch (e) {
          console.log(e);
        }
        cb();
      } else {
        cb();
      }
    }
  ], function(err) {
    data.controlId = baseItem._id;
    data.URL = normalizeUrl(settings.site_url + '/control/' + data.controlId);
    cb(err, data);
  });
};

templateDataResolvers.user = function(data, settings, cb) {
  var userId = '';
  if (_.isEmpty(data)) {
    return cb(null, {});
  }
  if (_.isString(data)) {
    userId = data;
  } else {
    userId = data.userId;
  }

  User.findById(userId, function(err, user) {
    cb(err, user);
  });
};

templateDataResolvers.comment = function(data, settings, cb) {
  cb(null , data);
};

templateDataResolvers.changedBy = templateDataResolvers.user;

templateDataResolvers.entity = function(data, settings, cb) {
  if (_.isEmpty(data)) {
    return cb(null, {});
  }
  cb(null , data);
};

templateDataResolvers.requestURL = function(url, settings, cb) {
  if (_.isEmpty(url)) {
    return cb(null, '');
  }
  url = settings.site_url + url;
  cb(null , url);
};

templateDataResolvers.organisationUnit = function(data, settings, cb) {
  var orgUnitId = '';
  if (_.isEmpty(data)) {
    return cb(null, {});
  }
  if (_.isString(data)) {
    orgUnitId = data;
  } else {
    orgUnitId = data._id || data.orgUnitId;
  }
  OrgUnit.findById(orgUnitId, function(err, orgUnit) {
    if (orgUnit) {
      orgUnit.orgUnitId = OrgUnit._id;
    }
    cb(err, orgUnit);
  });
};


function getTemplateData(key, baseData, settings, callback) {
  var data = _.extend({}, baseData);
  async.each(templates[key], function(template, next) {
    if (_.isFunction(templateDataResolvers[template])) {
      templateDataResolvers[template](data[template], settings, function(err, result) {
        if (!err && result) {
          data[template] = result;
        }
        next();
      });
    } else {
      next();
    }
  }, function() {
    callback(data);
  });
}

exports.getVariablesForKey = function getVariablesForKey(key) {
  var variables = [];
  _.each(templates[key], function(dataKey) {
    if (!variableSampleData[dataKey]) {
      return variables.push(dataKey);
    }
    _.each(_.keys(variableSampleData[dataKey]), function(variableKey) {
      var data = variableSampleData[dataKey][variableKey];
      if (variableKey === 'AuditHistory' && (key.contains('new') || key.contains('identified') || key.contains('scheduled'))) {
        return;
      }
      if (_.isArray(data)) {
        _.chain(data[0]).keys().each(function(varKey) {
          variables.push(dataKey + '.' + variableKey + '.[].' + varKey);
        });
      } else if (_.isObject(data)) {
        _.chain(data).keys().each(function(varKey) {
          if (_.isObject(data[varKey])) {
            _.chain(data[varKey]).keys().each(function(key) {
              variables.push(dataKey + '.' + variableKey + '.' + varKey + '.' + key);
            });
          } else {
            variables.push(dataKey + '.' + variableKey + '.' + varKey);
          }
        });
      } else {
        variables.push(dataKey + '.' + variableKey);
      }
    });
  });
  return variables;
};
