'use strict';
/* global angular */

angular.module('grcApp')

.config(function ($stateProvider) {
	$stateProvider
	.state('governance-record', {
		abstract: true,
		url: '/governance-record',
		templateUrl: "components/common/views/content.html",
		controller: 'gRecordCtrl',
		authenticate: true
	})
	.state('governance-record.list_all', {
		url: '/list',
		templateUrl: 'app/governance-record/record-list.html',
		controller: 'gRecordListCtrl',
		authenticate: true
	})
    .state('governance-record.new', {
        url: '/new',
        templateUrl: 'app/governance-record/record-edit.html',
        controller: 'gRecordEditCtrl',
        authenticate: true
    })
	.state('governance-record.view', {
		url: '/:recordId',
		templateUrl: 'app/governance-record/record-view.html',
		controller: 'gRecordViewCtrl',
		authenticate: true
	})
	.state('governance-record.edit', {
		url: '/:recordId/edit',
		templateUrl: 'app/governance-record/record-edit.html',
		controller: 'gRecordEditCtrl',
		authenticate: true
	});
});
