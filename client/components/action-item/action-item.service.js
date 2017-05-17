'use strict';

angular.module('grcApp').factory('ActionItem', function ($resource) {
  return $resource('/api/action-items/:id', {id: '@_id'}, {
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
});