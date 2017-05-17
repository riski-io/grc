'use strict';

(function() {

angular.module('grcApp')
  .factory('authInterceptor', function($rootScope, $q, $location) {
    return {
      // Add authorization token to headers
      request: function(config) {
        config.headers = config.headers || {};
        if (localStorage.getItem('access_token')) {
          config.headers.access_token = localStorage.getItem('access_token');
        }
        return config;
      },
      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if (response.status === 401) {
          // remove any state tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('id_token');
          $location.path('/login');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })
  .run(function($rootScope, $state, authService, $window) {    
    // Redirect to login if route requires auth and the user is not logged in, or doesn't have required role
    $rootScope.$on('$stateChangeStart', function(event, next) { 
      var isAuthenticated = $rootScope.isAuthenticated;
      $rootScope.loggedInUser = authService.getProfileDeferred();
      if (isAuthenticated && next.name === 'login') {
        //event.preventDefault();
        $window.location.href = "/";
        return;
      } 
      if(!next.authenticate) {
        return;
      }

      if (!authService.getToken()) {
         event.preventDefault()
         $state.go('login', {});
         return;
      }

      var query = (typeof next.authenticate === 'string') ? authService.hasRole : authService.getProfileDeferred;

      query(1,2).then(function(good){
        if(!good) {
          event.preventDefault();
          authService.getProfileDeferred(null)
          .then(function(is){
            $state.go(is ? 'app.main' : 'login');
          });
        }else{
          if(next.name === 'login'){
            $state.go('app.main');
          }
        }
      });
    });    
  });
})();
