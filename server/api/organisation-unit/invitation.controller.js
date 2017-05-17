'use strict';
var OrgUnit = require('./org-unit.model');
var OrgInvitaion = require('./invitation.model');
var config = require('../../lib/config');
var _ = require('lodash');
var async = require('async');
var User = require('../user/user.model');
var emailUtils = require('../util/emailUtils');


function createInvitation(invitation, callback) {
  invitation.isSignUpRequired = false;
  if (invitation.invitedBy && !invitation.invitedBy.userId) {
    invitation.isSignUpRequired = true;
  }
  var orgInvitation = new OrgInvitaion(invitation);
  orgInvitation.save(function (err, invitation) {
    callback(err, callback);
  });
}

exports.sendOrgInvitaions = function(req, res) {
  var body = req.body.invitation;
  var sender = req.user;
  var invitation = {
    invitedBy : sender.userId,
    assignedRole: body.role,
    orgUnit: body.orgUnit.orgUnitId,
    sender : sender
  };

  var invalidEmails = [];
  var emailErrors = [];
  var messages = [];
  var errors = [];

  async.each(body.recipients, function(email, cb) {
    email = email.toLowerCase();
    User.findOne({
      'email': email
    }, function(err, user) {
      OrgUnit.findById(invitation.orgUnit, function(err, orgUnit) {
        if (err || !orgUnit) {
          errors.push(err || orgUnit + ' Not Found');
          return cb();
        }
        if (err || !user) {
          User.findOne({email : email}, function(err, user) {
            if (err || !user) {
              invalidEmails.push('new user ' + email + ' is not found - please confirm that the email is correct');
              errors.push(err);
              return cb();
            }
            if (invitation.assignedRole === 'member') {
              orgUnit.memberList = orgUnit.memberList || [];
              if (!_.includes(orgUnit.memberList, user.userId)) {
                orgUnit.memberList.push(user.userId);
              }
            } else {
              orgUnit.managerList = orgUnit.managerList || [];
              if (!_.includes(orgUnit.managerList, user.userId)) {
                orgUnit.managerList.push(user.userId);
              }
            }
            messages.push('New user ' + user.email + ' added to ' + orgUnit.orgName + ' as ' + invitation.assignedRole);
            orgUnit.save(function(err) {
              if (err) {
                cb();
                return errors.push('Error in adding '+user.email+' to '+orgUnit.orgName);
              }
              var newUser = new User(user);
              newUser.role = invitation.assignedRole || 'member';
              newUser.defaultOrgUnit = orgUnit.orgUnitId;
              newUser.save(function(err) {
                if (err) {
                  cb();
                  return errors.push('Error in adding '+user.email+' to '+orgUnit.orgName);
                }
                invitation.invitation = invitation;
                emailUtils.send([newUser.userId], [sender.email], 'member.confirmation', invitation, function(err) {
                  delete invitation.invitation;
                  createInvitation(invitation, function (err) {
                    if (err) {
                      return errors.push('Error in adding '+user.email+' to '+orgUnit.orgName);
                    }
                  });
                });
                cb();
              });
            });
          });
        } else {
          orgUnit.memberList = orgUnit.memberList || [];
          orgUnit.managerList = orgUnit.managerList || [];
          if (invitation.assignedRole === 'member' && _.includes(orgUnit.memberList, user.userId)) {
            messages.push('Existing user ' + user.email + ' is already a ' + invitation.assignedRole + ' in ' + orgUnit.orgName);
            return cb();
          } else if (invitation.assignedRole === 'member' && !_.includes(orgUnit.memberList, user.userId)) {
            if (_.includes(orgUnit.managerList, user.userId)) {
              messages.push('Existing user ' + user.email + ' role is changed to ' + invitation.assignedRole + ' in ' + orgUnit.orgName);
              orgUnit.managerList = _.pull(orgUnit.managerList, user.userId);
            } else {
              messages.push('Existing user ' + user.email + ' added to ' + orgUnit.orgName + ' as ' + invitation.assignedRole);
            }
            orgUnit.memberList.push(user.userId);
          } else if (invitation.assignedRole === 'manager' && _.includes(orgUnit.managerList, user.userId)) {
            messages.push('Existing user ' + user.email + ' is already a ' + invitation.assignedRole + ' in ' + orgUnit.orgName);
            return cb();
          } else if (invitation.assignedRole === 'manager' && !_.includes(orgUnit.managerList, user.userId)) {
            if (_.includes(orgUnit.memberList, user.userId)) {
              messages.push('Existing user ' + user.email + ' role is changed to ' + invitation.assignedRole + ' in ' + orgUnit.orgName);
              orgUnit.memberList = _.pull(orgUnit.memberList, user.userId);
            } else {
              messages.push('Existing user ' + user.email + ' added to ' + orgUnit.orgName + ' as ' + invitation.assignedRole);
            }
            orgUnit.managerList.push(user.userId);
          }
          orgUnit.save(function(err) {
            if (err) {
              return res.send(422, new Error('Error in adding the user to org unit'));
            }
            if (!user.defaultOrgUnit) {
              user.defaultOrgUnit = orgUnit.orgUnitId;
              user.save();
            }
            invitation.invitation = invitation;
            emailUtils.send([user.userId], [sender.email], 'member.confirmation', invitation, function(err) {
              delete invitation.invitation;
              createInvitation(invitation, function (err) {
                if (err) {
                  return errors.push('Error in adding '+user.email+' to '+orgUnit.orgName);
                }
              });
            });
            cb();
          });
        }
      });
    });
  }, function() {
    res.json({
      invalidEmails: invalidEmails,
      emailErrors: emailErrors,
      messages: messages
    });
  });
};


exports.requestMembership = function (req , res) {
  var body = req.body.invitation;
  var sender = req.user;
  var recipient = body.recipient;
  var invitation = {
    assignedRole: req.user.role,
    invitedBy: req.user.userId,
    isRequest : true,
    isCompleted : false,
    invitee : recipient.userId
  };
  var orgInvitation = new OrgInvitaion(invitation);
  orgInvitation.save(function (err) {
    if (err) {
      return res.send(422, new Error('Error in requesting membership , please try again later'));
    }
    orgInvitation.approver = body.recipient;
    orgInvitation.requestor = req.user;
    orgInvitation.requestURL  = 'member/requests';

    emailUtils.send([recipient.userId], [sender.email], 'membership.request', orgInvitation, function(err) {
      console.log('send emails for member.confirmation', err);
      if (err) {
        return res.send(422 , new Error(err));
      }
      res.send(true);
    });
  });
};

exports.approveRequest = function  (req , res) {
  var invitationId = req.params.invitationId;
  OrgInvitaion.findById(invitationId)
  .populate('invitedBy invitee')
  .exec(function(err, invitation) {
    if (err || !invitation) {
      return res.send(422, new Error('Invitation not found'));
    }
    if (invitation.isCompleted) {
      return res.send(invitation);
    }
    OrgUnit.findById({
      orgUnitId: invitation.orgUnitId
    }, function(err, orgUnit) {
      if (err || !orgUnit) {
        return res.send(422, new Error('Org Unit not found'));
      }
      if (invitation.user.role === 'member') {
        orgUnit.memberList = orgUnit.memberList || [];
        if (!_.includes(orgUnit.memberList, invitation.user.userId)) {
          orgUnit.memberList.push(invitation.user.userId);
        }
      } else {
        orgUnit.managerList = orgUnit.managerList || [];
        if (!_.includes(orgUnit.managerList, invitation.user.userId)) {
          orgUnit.managerList.push(invitation.user.userId);
        }
      }
      orgUnit.save(function(err) {
        if (err) {
          return res.send(422, new Error('Error in adding the user to org unit'));
        }
        try {
          User.get({
            userId: invitation.user.userId
          }, function(err, user) {
            if (!user) {
              user = new User(invitation.user);
              user = user.role || invitation.user.role || 'member';
              user.save();
            }
          });
        } catch (e) {
          //
        }
        invitation.isCompleted = true;
        invitation.save(function(err) {
          if (err) {
            return res.send(422, new Error('Error'));
          }
          invitation.invitation = invitation;
          emailUtils.send([invitation.user.userId], [invitation.recipient.email], 'member.confirmation', invitation, function(err) {
            console.log('send emails for member.confirmation', err);
          });
          res.send(true);
        });
      });
    });
  });
};

exports.getOrgInvitations = function(req, res) {
  var orgUnitId = req.params.orgUnitId;
  OrgInvitaion.find({
    orgUnitId: orgUnitId,
    isCompleted: false
  }, function(err, invitations) {
    if (err) {
      return res.send(422);
    }
    res.send(200, invitations);
  });
};


exports.verifyInvitations = function(req, res) {
  var invitationId = req.params.invitationId;
  OrgInvitaion.findById(invitationId)
  .populate('invitedBy invitee orgUnit')
  .exec(function(err, invitation) {
    if (err || !invitation) {
      return res.send(422, new Error('Invitation not found'));
    }
    if (invitation.isCompleted) {
      invitation.alreadyAdded = true;
      return res.send(invitation);
    }
    OrgUnit.findOne({
      '_id': invitation.orgUnit._id
    }, function(err, orgUnit) {
      if (err || !orgUnit) {
        return res.send(422, new Error('Org Unit not found'));
      }
      if (invitation.assignedRole === 'member') {
        orgUnit.memberList = orgUnit.memberList || [];
        if (!_.includes(orgUnit.memberList, invitation.invitee.userId)) {
          orgUnit.memberList.push(invitation.invitee.userId);
        }
      } else {
        orgUnit.managerList = orgUnit.managerList || [];
        if (!_.includes(orgUnit.managerList, invitation.invitee.userId)) {
          orgUnit.managerList.push(invitation.invitee.userId);
        }
      }
      orgUnit.save(function(err) {
        if (err) {
          return res.send(422, new Error('Error in adding the user to org unit'));
        }
        try {
          User.findOne({
            _id: invitation.invitee.userId
          }, function(err, user) {
            if (!user) {
              user = new User(invitation.invitee);
              user = user.role || invitation.assignedRole || 'member';
              user.save();
            }
          });
        } catch (e) {
          //
        }
        emailUtils.send([invitation.invitee.userId], [invitation.invitedBy.email], 'member.confirmation', invitation, function(err) {
          console.log('send emails for member.confirmation', err);
        });
        invitation.isCompleted = true;
        invitation.save(function(err) {
          if (err) {
            return res.send(422, new Error('Error'));
          }
          res.json(invitation);
        });
      });
    });
  });
};


exports.getInvitations = function(req, res) {
  var userId = req.user.userId;
  OrgInvitaion.find({
    isCompleted : false,
    invitee : userId
  })
  .populate('invitedBy invitee orgUnit')
  .exec(function(err, invitations) {
    if (err) {
      return res.send(500, new Error('Error in fetching the invitation'));
    }
    res.send(200, invitations);
  });
};