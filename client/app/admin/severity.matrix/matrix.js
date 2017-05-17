'use strict';

angular.module('grcApp').config(function($stateProvider) {
  $stateProvider.state('admin.matrix', {
    url: '/matrix',
    templateUrl: 'app/admin/severity.matrix/matrix.html',
    controller: 'MatrixCtrl',
    authenticate: true,
    access : 'admin'
  });
});
