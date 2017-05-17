'use strict';

angular.module('grcApp').factory('Enum', ['$resource', function($resource) {
    return $resource('/api/enums/:id', {id: '@id'});
}])
.service('EnumItem', function ($resource) {
    return $resource('/api/enum-items/:id', {id: '@id'});
})
.service('EnumItems', function (EnumItem) {
  var enums = {};
  return {
    getAllItems: function () {
      if (enums && _.isEmpty(enums)) {
        enums = EnumItem.query().$promise.then(function (collection) {
          enums = Object.assign(enums,  _.groupBy(collection, 'key'));
        });
      }
     return enums;
   }
 };
});