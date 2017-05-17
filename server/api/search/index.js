'use strict';

var express = require('express');
var controller = require('./search.controller');
var config = require('../../lib/config');
var auth = require('../../auth/auth.service');
//var searchIndexUtils = require('../util/searchIndexes');

var router = express.Router();
router.get('/reindex-documents', controller.reIndex);
//router.get('/delete-search-documents', auth.isAdmin(), controller.clearAllSearchDocuments);
router.post('/get-aggregations', auth.isAuthenticated(), controller.visualize);
router.post('/get-hierarchy-browser', auth.isAuthenticated(), controller.hierarchyBrowser);
router.post('/', auth.isAuthenticated(), controller.search);
router.post('/:query', auth.isAuthenticated(), controller.search);
module.exports = router;
