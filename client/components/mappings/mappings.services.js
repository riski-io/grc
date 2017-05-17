'use strict';

angular.module('grcApp').factory('Mappings', ['$resource', function($resource) {
    return $resource('/api/data-migration/mappings/:key/:id', {key: '@key', id: '@id'}, {
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
      },
      delete: {
        method: 'DELETE'
      },
      create: {
        method: 'POST',
      },
    });
  }]);
