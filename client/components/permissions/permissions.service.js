'use strict';

angular.module('grcApp').factory('Permissions', ['$resource', function($resource) {
    return $resource('/api/permissions/:id', {id: '@id'}, {
      list: {
        method: 'GET',
        isArray: true
      },
      get: {
        method: 'GET',
        isArray: false
      },
      update: {
        method: 'PUT'
      },
      save: {
        method: 'POST'
      },
      remove: {
        method: 'DELETE'
      }
    });
  }]);
