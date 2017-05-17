'use strict';

var express = require('express');
var controller = require('./pdf');
var router = express.Router();

router.post('/generate/:type', controller.downloadPDFReport);


module.exports = router;
