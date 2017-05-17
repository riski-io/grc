'use strict';

angular.module('grcApp').factory('Control', ['$resource', function($resource) {
    return $resource('/api/controls/:id', { id: '@_id'}, {
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
        },
        merge: {
          method: 'POST'
        }
    });
}])