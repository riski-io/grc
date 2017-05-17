'use strict';
/* global angular */

angular.module('grcApp')
.config(function ($stateProvider) {
	$stateProvider
    .state('member', {
        url: '/member',
        templateUrl: "components/common/views/content.html",
        controller: 'MemberCtrl',
        authenticate: true
    })
    .state('member.list_all', {
        url: '/list',
        templateUrl: 'app/member/member-list.html',
        controller: 'MemberListCtrl',
        authenticate: true
    })
    .state('member.new', {
        url: '/new',
        templateUrl: 'app/member/member-invite.html',
        controller: 'MemberInviteCtrl',
        authenticate: true
    })
    .state('member.request', {
        url: '/requests',
        templateUrl: 'app/member/member-requests.html',
        controller: 'MembershipRequestCtrl',
        authenticate: true
    })
    .state('member.view', {
		url: '/:userId',
		templateUrl: 'app/member/member-view.html',
		controller: 'MemberViewCtrl',
        authenticate: true
	})
    .state('member.edit', {
        url: '/:userId/edit',
        templateUrl: 'app/member/member-edit.html',
        controller: 'MemberEditCtrl',
        authenticate: true
    });

});