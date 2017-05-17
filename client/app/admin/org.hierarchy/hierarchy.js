'use strict';

angular.module('grcApp').config(function($stateProvider) {
  $stateProvider
  .state('admin.hierarchy', {
    url: '/hierarchy',
    templateUrl: 'app/admin/org.hierarchy/hierarchy.html',
    controller: 'HierarchyCtrl',
    authenticate : true,
    access : 'admin'
  });
});
