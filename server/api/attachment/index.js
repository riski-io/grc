'use strict';

var express = require('express');
var controller = require('./attachment.controller');
var config = require('../../lib/config');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/:refEntityId', auth.isAuthenticated() , controller.getAttachments);
router.delete('/:refEntityId/:attachmentId', auth.isAuthenticated() , controller.destroy);
router.get('/:refEntityId/:attachmentId', auth.isAuthenticated() , controller.getAttachment);
router.post('/:refEntityId', auth.isAuthenticated() , controller.create);

module.exports = router;
