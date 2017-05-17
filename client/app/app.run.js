'use strict';

angular.module('grcApp')
    .run(function($rootScope, $location, $state, authService, lock, authManager) {
    // Put the authService on $rootScope so its methods
    // can be accessed from the nav bar
    $rootScope.authService = authService;

    // Register synchronous hash parser
    lock.interceptHash();

    // Register the authentication listener that is
    // set up in auth.service.js
    authService.registerAuthenticationListener();

    // Use the authManager from angular-jwt to check for
    // the user's authentication state when the page is
    // refreshed and maintain authentication
    authManager.checkAuthOnRefresh();

    authService.getBuildVersion();
    $rootScope.$state = $state;
    $rootScope.slugify = function(string) {
      return string.toLowerCase()
        .replace(/[^\w\s-]/g, '') // remove non-word [a-z0-9_], non-whitespace, non-hyphen characters
        .replace(/[\s_-]+/g, '-') // swap any length of whitespace, underscore, hyphen characters with a single -
        .replace(/^-+|-+$/g, '');
    }
});