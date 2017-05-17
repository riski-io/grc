(function () {

  'use strict';

  angular
    .module('grcApp')
    .service('authService', authService);

  authService.$inject = ['lock', '$rootScope','authManager', '$q', '$http', 'User', 'Permissions', 'OrgUnits', 'spinner'];


  function authService(lock, $rootScope, authManager, $q, $http, User, Permissions, OrgUnits, spinner) {
    var userProfile = null;
    var deferredProfile = $q.defer();
    var authenticating = false;

    if (userProfile) {
      deferredProfile.resolve(userProfile);
    }

    function internalLogin() {
      if (getToken()) {
        spinner.startSpinner();
        User.get().$promise.then(function (profile) {
          userProfile = profile;
          localStorage.setItem('profile', JSON.stringify(profile));
          deferredProfile.resolve(profile);
          getPermissions();
          OrgUnits.getOrgTree()
          .then(function() {
            spinner.stopSpinner();
            if ($rootScope.orgTree && !$rootScope.orgTree.length) {
              $rootScope.$state.go('permissions.membership');
            }
          });
        });
      }
    }

    function login() {
      lock.show();
    }

    // Logging out just requires removing the user's
    // id_token and profile
    function logout() {
      deferredProfile = $q.defer();
      localStorage.removeItem('id_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('profile');
      authManager.unauthenticate();
      userProfile = null;
    }

    // Set up the logic for when a user authenticates
    // This method is called from app.run.js
    function registerAuthenticationListener() {
      lock.on('authenticated', function (authResult) {
        if (authenticating) {
          return;
        }
        localStorage.setItem('id_token', authResult.idToken);
        if (authResult.accessToken) {
          localStorage.setItem('access_token', authResult.accessToken);
        }
        spinner.startSpinner();
        authManager.authenticate();
        authenticating = true;
        $state.go('home.main');
/*        User.get().$promise.then(function (profile) {
          authenticating = false;
          userProfile = profile;
          localStorage.setItem('profile', JSON.stringify(profile));
          deferredProfile.resolve(profile);
          getPermissions();
          spinner.stopSpinner();
        });*/
      });
    }

    function getProfileDeferred() {
      return deferredProfile.promise;
    }

    /**
     * Check if a user is an admin
     *
     * @return {Boolean}
     */
    function isAdmin() {
      return userProfile.role === 'account_admin' || userProfile.role === 'admin';
    }
    /**
     * Check if a user is a manager
     *
     * @return {Boolean}
     */
    function isManager() {
      return userProfile.role === 'manager';
    }
    /**
     * Get auth token
     */
    function getToken() {
      return localStorage.getItem('id_token');
    }
    /**
     * Get permissions
     */
    function getPermissions() {
      Permissions.get().$promise.then(function (permissions) {
        $rootScope.rolePermissions = permissions;
      });
    }

    /**
     * Get build version
     */
    function getBuildVersion() {
      $http.get('/build-version').success(function(version) {
        version.RISKI_BUILD_ID = String(version.RISKI_BUILD_ID).substring(0, 20);
        $rootScope.buildVersion = version;
      }).error(function() {
        //
      });
    }

    internalLogin();
    
    return {
      getToken : getToken,
      isAdmin : isAdmin,
      isManager : isManager,
      login: login,
      logout: logout,
      registerAuthenticationListener: registerAuthenticationListener,
      getProfileDeferred: getProfileDeferred,
      getCurrentUser: getProfileDeferred,
      getBuildVersion: getBuildVersion
    }
  }
})();