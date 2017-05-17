'use strict';

function LoginController(authService) {
  setTimeout(function(){
      authService.login('login-container')
    },0)
}

angular.module('grcApp')
  .controller('LoginCtrl', LoginController);
