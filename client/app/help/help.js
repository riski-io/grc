'use strict';
/* global angular */

angular.module('grcApp')
.config(function ($stateProvider) {
	$stateProvider
    .state('help', {
        url: '/help',
        abstract: true,
        templateUrl: "components/common/views/content.html",
        controller: 'HelpCtrl',
        authenticate: true,
        access : 'admin'
    })
    .state('help.list', {
        url: '/list',
        templateUrl: 'app/help/help-list.html',
        controller: 'HelpListCtrl',
        authenticate: true
    })
    .state('help.new', {
        url: '/new',
        templateUrl: 'app/help/help-edit.html',
        controller: 'HelpEditCtrl',
        authenticate: true
    })
    .state('help.view', {
		url: '/:id/view',
		templateUrl: 'app/help/help-view.html',
		controller: 'HelpViewCtrl',
        authenticate: true
	})
    .state('help.edit', {
        url: '/:id/edit',
        templateUrl: 'app/help/help-edit.html',
        controller: 'HelpEditCtrl',
        authenticate: true
    });
})

.value(
	'pageTypes',
    [{
        value : 'home.main',
        name : 'Overview',
        icon : 'fa-eye'
    },{
        value : 'review.list',
        name : 'List Reviews',
        icon : 'fa-comments'
    },{
        value : 'review.edit',
        name : 'Edit Review',
        icon : 'fa-comments'
    },{
        value : 'review.view',
        name : 'View Review',
        icon : 'fa-comments'
    },{
        value : 'review.new',
        name : 'Create Review',
        icon : 'fa-comments'
    },{
        value : 'governance-record.list_all',
        name : 'List Governance Records',
        icon : 'fa-file-text'        
    },{
        value : 'governance-record.new',
        name : 'Create Governance Record',
        icon : 'fa-file-text'        
    },{
        value : 'governance-record.edit',
        name : 'Edit Governance Records',
        icon : 'fa-file-text'        
    },{
        value : 'governance-record.view',
        name : 'View Governance Record',
        icon : 'fa-file-text'        
    },{
        value : 'control.list_all',
        name : 'List Controls',
        icon : 'fa-clone'        
    },{
        value : 'control.new',
        name : 'Create Control',
        icon : 'fa-clone'        
    },{
        value : 'control.edit',
        name : 'Edit Control',
        icon : 'fa-clone'        
    },{
        value : 'control.view',
        name : 'View Control',
        icon : 'fa-clone'        
    },{
        value : 'action-item.list',
        name : 'List Action Items',
        icon : 'fa-asterisk'        
    },{
        value : 'action-item.edit',
        name : 'Edit Action Item',
        icon : 'fa-asterisk'        
    },{
        value : 'action-item.view',
        name : 'View Action Item',
        icon : 'fa-asterisk'        
    },{
        value : 'action-item.new',
        name : 'Create Action Item',
        icon : 'fa-asterisk'        
    },{
        value : 'reports',
        name : 'Reports',
        icon : 'fa-line-chart'        
    },{
        value : 'admin',
        name : 'Administration',
        icon : 'fa-user-secret'        
    }]
);