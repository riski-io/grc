'use strict';

angular.module('grcApp').factory('GovernanceRecord', ['$resource', function($resource) {
    return $resource('/api/governance-records/:id', { id: '@_id' }, {
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

.factory('GovernanceRecordByOrgUnit', ['$resource', function ($resource) {
  return $resource('/api/governance-records/filter/:orgUnitId', {orgUnitId: '@_orgUnitId'}, {
    listAll: {
      method: 'GET',
      isArray: true
    },
    listAllWithChildren: {
      method: 'GET',
      isArray: true,
      params: {'children': true}
    }
  });
}]);
