'use strict';

angular.module('grcApp').factory('Matrix', ['$resource', function($resource) {
    return $resource('/api/matrix/:itemId/:rating', {itemId: '@itemId', rating: '@rating'}, {
      listAll: {
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
  }])

.service('MatrixService', ['$resource', function($resource) {
    return $resource('/api/matrix/:itemId/:rating', {itemId: '@itemId', rating: '@rating'}, {
      listAll: {
        method: 'GET',
        isArray: true,
        cache: true
      }
    });
  }]);
