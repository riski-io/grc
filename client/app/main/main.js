'use strict';

angular.module('grcApp')
  .config(function ($stateProvider) {

    $stateProvider
      .state('home', {
        abstract: true,
        url: '/home',
        templateUrl: "components/common/views/content.html",
        authenticate: true
      })
      .state('home.main', {
        url: '/app',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl',
        authenticate: true
      })
    .state('home.org-invitation', {
	    url: '/org-invitation/:invitationId',
	    templateUrl: 'app/main/org-invitation.html',
	    controller: 'InvitationCtrl',
      authenticate: true
	  });
  });