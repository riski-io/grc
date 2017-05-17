'use strict';

angular.module('grcApp').config(function($stateProvider) {
  $stateProvider.state('admin.permissions', {
    url: '/permissions',
    templateUrl: 'app/admin/permissions/permissions.html',
    controller: 'PermissionsCtrl',
    authenticate : true,
    access : 'admin'
  });
});
