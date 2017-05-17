'use strict';

angular.module('grcApp').factory('History', ['$resource', function($resource) {
    return $resource('/api/audit-history/:historyId', { historyId: '@_historyId' }, {
        getVersions: {
            method: 'GET',
            isArray: true
        },
        getVersion: {
            method: 'GET'
        }
    });
}]);
