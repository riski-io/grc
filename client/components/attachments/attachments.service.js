'use strict';

angular.module('grcApp').factory('Attachment', ['$resource', function($resource) {
    return $resource('/api/attachments/:refEntityId/:attachmentId', { refEntityId: '@_refEntityId', attachmentId: '@_attachmentId' }, {
        listAll: {
            method: 'GET',
            isArray: true,
            params: {
                attachmentId: ''
            }
        },
        get: {
            method: 'GET',
            isArray: false
        },
        save: {
            method: 'POST',
            params: {
                attachmentId: ''
            }
        },
        remove: {
            method: 'DELETE'
        }
    });
}]);
