'use strict';

angular.module('grcApp')
.factory('ComplianceForm', ['$resource', function($resource) {
    return $resource('/api/compliance-forms/:id', { id: '@_id' },
    {
        'update': { method:'PUT' }
    });
}])
.factory('ComplianceFormTemplate', ['$resource', function($resource) {
    return $resource('/api/compliance-form-templates/:id', { id: '@_id' },{
        'update': { method:'PUT' }
    });
}])
.factory('ComplianceFormResponse', ['$resource', function($resource) {
    return $resource('/api/compliance-form-responses/:id', { id: '@_id' },    {
        'update': { method:'PUT' }
    });
}]);