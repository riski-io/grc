'use strict';

angular.module('grcApp').config(function($stateProvider) {
  $stateProvider.state('admin.kpi', {
    url: '/kpi',
    templateUrl: 'app/admin/kpi/kpi.html',
    controller: 'SettingsCtrl',
    authenticate : true,
    access : 'admin'
  });
});
