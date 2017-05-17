'use strict';

angular.module('grcApp').factory('UserDetails', ['$resource', function($resource) {
    return $resource('/api/users/user-details/:id', { id: '@_id' }, {
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

.factory('Member', ['$resource', function($resource) {
    return $resource('/api/users/:id', { id: '@_id' }, {
        update: {
            method: 'PUT'
        }
    });
}])

.factory('ChangeMembershipRole', ['$resource', function($resource) {
    return $resource('/api/organisation-units/change-role/:userId/:orgUnitId', { userId: '@_id',  orgUnitId: '@orgUnitId'}, {
        update: {
            method: 'PUT'
        }
    });
}])

.factory('Users', function($resource, $cacheFactory, $http) {
    var cache = $cacheFactory('Users');
    var User = $resource('/api/users');

    return {
        searchUsers : function(val) {
          return $http.get('/api/users/search/' + val).then(function(res) {
            var users = [];
            angular.forEach(res.data, function(item) {
              users.push(item);
            });
            return users;
          });
        },
        getAllUsers: function() {
            var users = cache.get('users');
            if (!users) {
                users = User.query();
                cache.put('users', users);
            }
            return users;
        }
    };
});
