'use strict';

angular.module('grcApp').factory('Hierarchy', ['$resource', function($resource) {
    return $resource('/api/hierarchy/:id/:rating', {id: '@id'}, {
      listAll: {
        method: 'GET',
        isArray: false
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
