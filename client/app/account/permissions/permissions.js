'use strict';
/* global angular */

angular.module('grcApp')

    .config(function ($stateProvider) {
        $stateProvider
            .state('permissions', {
                abstract: true,
                url: '/permissions',
                templateUrl: "components/common/views/content.html",
                controller: 'permissionsCtrl',
                authenticate: true
            })
            .state('permissions.membership', {
                url: '/membership',
                templateUrl: 'app/account/permissions/request-membership.html',
                controller: 'membershipCtrl',
                authenticate: true
            })
            .state('permissions.request', {
                url: '/request',
                templateUrl: 'app/account/permissions/request-permission.html',
                controller: 'requestCtrl',
                authenticate: true
            });
    });