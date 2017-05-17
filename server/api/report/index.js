'use strict';

var express = require('express');
var controller = require('./report.controller');
var config = require('../../lib/config');
var auth = require('../../auth/auth.service');

var router = express.Router();
router.get('/report', controller.report);