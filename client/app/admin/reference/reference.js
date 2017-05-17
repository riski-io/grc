'use strict';

angular.module('grcApp').config(function($stateProvider) {
  $stateProvider.state('admin.reference', {
    url: '/reference',
    templateUrl: 'app/admin/reference/reference.html',
    controller: 'ReferenceCtrl',
    authenticate : true,
    access : 'admin'
  });
});
