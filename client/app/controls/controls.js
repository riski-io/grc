'use strict';
/* global angular */

angular.module('grcApp')

.config(function ($stateProvider) {
	$stateProvider
	.state('control', {
		abstract: true,
		url: '/control',
		templateUrl: "components/common/views/content.html",
		controller: 'controlsCtrl',
		authenticate: true
	})
	.state('control.list_all', {
		url: '/list',
		templateUrl: 'app/controls/controls-list.html',
		controller: 'controlsListCtrl',
        authenticate: true
	})
    .state('control.new', {
        url: '/new',
        templateUrl: 'app/controls/controls-edit.html',
        controller: 'controlsEditCtrl',
        authenticate: true
    })
	.state('control.view', {
		url: '/:controlId',
		templateUrl: 'app/controls/controls-view.html',
		controller: 'controlsViewCtrl',
		authenticate: true
	})
	.state('control.edit', {
		url: '/:controlId/edit',
		templateUrl: 'app/controls/controls-edit.html',
		controller: 'controlsEditCtrl',
		authenticate: true
	});
});