'use strict';
/* global angular */

angular.module('grcApp')
.config(function ($stateProvider) {
	$stateProvider
    .state('action-item', {
        url: '/action-item',
        templateUrl: "components/common/views/content.html",
        controller: 'ActionItemCtrl',
        authenticate: true
    })
    .state('action-item.list', {
        url: '/list',
        templateUrl: 'app/action-item/action-item-list.html',
        controller: 'ActionItemListCtrl',
        authenticate: true
    })
    .state('action-item.new', {
        url: '/new?refEntityType:refEntityId',
        templateUrl: 'app/action-item/action-item-edit.html',
        controller: 'ActionItemEditCtrl',
        authenticate: true
    })
    .state('action-item.view', {
		url: '/:actionItemId',
		templateUrl: 'app/action-item/action-item-view.html',
		controller: 'ActionViewCtrl',
        authenticate: true
	})
    .state('action-item.edit', {
        url: '/:actionItemId/edit',
        templateUrl: 'app/action-item/action-item-edit.html',
        controller: 'ActionItemEditCtrl',
        authenticate: true
    });

});