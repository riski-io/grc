'use strict';

angular.module('grcApp').factory('Settings', ['$resource', function($resource) {
    return $resource('/api/settings/:key', {key: '@key'}, {
      list: {
        method: 'GET',
        isArray: false
      },
      get: {
        method: 'GET',
        isArray: false
      },
      update: {
        method: 'PUT'
      }
    });
  }]);
