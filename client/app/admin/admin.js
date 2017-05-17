'use strict';

angular.module('grcApp').config(function($stateProvider) {
  $stateProvider.state('admin', {
    url: '/admin',
    templateUrl: 'components/common/views/content.html',
    controller: 'AdminCtrl',
    authenticate : true,
    access : 'admin'
  });
});
