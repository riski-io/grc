'use strict';
/* global angular */

angular.module('grcApp')
.controller('SidebarCtrl', function ($scope, $location, authService){
    var vm = this;
    vm.currentUser = authService.getCurrentUser();
    vm.currentUser.then(function(user) {
        vm.currentUser = user;
    });

    $scope.logout = function() {
        authService.logout();
        $location.path('/login');
    };
})
