"use strict";

import errors from './components/errors';

const Router = require('express').Router;
const router = new Router();
// Insert routes below
router.use('/users', require('./api/user'));
router.use('/governance-records', require('./api/governancerecord'));
router.use('/audit-history', require('./api/audithistory'));
router.use('/comments', require('./api/comment'));
router.use('/attachments', require('./api/attachment'));
router.use('/reviews', require('./api/review'));
router.use('/controls', require('./api/control'));
router.use('/action-items', require('./api/actionitem'));
router.use('/organisation-units', require('./api/organisation-unit'));
router.use('/enums', require('./api/enum'));
router.use('/enum-items', require('./api/enumitem'));
router.use('/settings', require('./api/settings'));
router.use('/matrix', require('./api/conceptmatrix'));
router.use('/pdf', require('./api/pdf'));
router.use('/email-templates', require('./api/emailtemplate'));
router.use('/permissions', require('./api/permission'));
router.use('/search', require('./api/search'));
router.use('/help-pages', require('./api/helppage'));

export default router;