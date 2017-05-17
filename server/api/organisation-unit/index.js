'use strict';

var express = require('express');
var controller = require('./org-unit.controller');
var invitationController = require('./invitation.controller');
var config = require('../../lib/config');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/invitations' , auth.isAuthenticated(), invitationController.getInvitations);
router.delete('/:orgUnitId', auth.isAuthenticated(), controller.destroy);
router.put('/:orgUnitId', auth.isAuthenticated(), controller.update);
router.put('/change-role/:userId/:orgUnitId', auth.isAuthenticated(), controller.changeRole);
router.put('/:orgUnitId/:userId/:role' , auth.isAuthenticated(), controller.removeUser);
router.get('/:orgUnitId', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.get('/by-user/:id', auth.isAuthenticated(), controller.getOrgUnitByUser);

router.post('/request-membership', auth.isAuthenticated(), invitationController.requestMembership);
router.post('/invitations/:orgUnitId' , auth.isAuthenticated(), invitationController.sendOrgInvitaions);
router.get('/invitations/:orgUnitId' , auth.isAuthenticated(), invitationController.getOrgInvitations);
router.get('/verify-org-invitation/:invitationId' , invitationController.verifyInvitations);
router.get('/invitations/approve/:invitationId' , invitationController.approveRequest);

module.exports = router;
