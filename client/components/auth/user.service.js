'use strict';

angular.module('grcApp')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      },
      getById: {
        method: 'GET'
      },
      listAll: {
        method: 'GET',
        isArray: true
      }
	});
  });
