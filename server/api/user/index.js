'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../lib/config');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.delete('/:id', auth.isAdmin(), controller.destroy);
router.get('/me', auth.isAuthenticated() , controller.me);
router.get('/get-all-admins', controller.getAdminUsers);
router.get('/search/:name', auth.isAuthenticated() , controller.search);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.put('/:id', auth.isAuthenticated(), controller.updateRole);
router.post('/', auth.isAuthenticated(), controller.create);
module.exports = router;
