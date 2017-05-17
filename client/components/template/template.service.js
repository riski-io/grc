'use strict';

angular.module('grcApp').factory('Template', ['$resource', function($resource) {
    return $resource('/api/email-templates/:id', {id: '@id'}, {
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
  }]);
