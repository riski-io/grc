'use strict';

angular.module('grcApp').factory('Review', ['$resource', function ($resource) {
  return $resource('/api/reviews/:id', {id: '@_id'}, {
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

.factory('ReviewByOrgUnit', ['$resource', function ($resource) {
  return $resource('/api/reviews/filter/:orgUnitId', {orgUnitId: '@_orgUnitId'}, {
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
