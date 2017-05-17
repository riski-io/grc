'use strict';

angular.module('grcApp').factory('HelpPages', ['$resource', function($resource) {
    return $resource('/api/help-pages/:id', {id: '@id'}, {
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
      delete: {
        method: 'DELETE'
      },
      create: {
        method: 'POST',
      },
    });
  }]);
