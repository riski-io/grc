'use strict';

angular.module('grcApp').config(function($stateProvider) {
  $stateProvider.state('admin.settings', {
    url: '/settings',
    templateUrl: 'app/admin/settings/settings.html',
    controller: 'SettingsCtrl',
    authenticate : true,
    access : 'admin'
  });
});
