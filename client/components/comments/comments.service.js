'use strict';

angular.module('grcApp').factory('Comment', ['$resource', function($resource) {
    return $resource('/api/comments/:commentId', { commentId: '@_commentId' }, {
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
