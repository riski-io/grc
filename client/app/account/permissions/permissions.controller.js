'use strict';
/* global angular */

angular.module('grcApp')

.controller('permissionsCtrl', function ($scope, OrgUnits) {
    $scope.orgUnits = OrgUnits.getAllOrgUnits();
    $scope.admins = [];

    $scope.getOrgDetails = function (orgUnit) {
    	if(orgUnit.managerList && orgUnit.managerList.length){
    		OrgUnits.getOrgUnit(orgUnit.orgUnitId).$promise.then(function(org) {
		      $scope.orgDetails = org;
		    });
    	}
    };
    OrgUnits.getAllAdmins(function (users) {
    	$scope.admins = users;
    }, function () {
    	// 
    });
})

.controller('membershipCtrl', function ($scope, $http, $timeout, spinner) {
    $scope.requestMembership = function () {
        spinner.startSpinner();
        $http.post('/api/organisation-units/request-membership', {invitation : $scope.invitation})
        .success(function () {
            spinner.stopSpinner();
            $scope.message = 'Request sent successfully';
            $scope.type = 'alert-success';
            $timeout(function() {
                $scope.message = '';
                $scope.type = '';
            }, 5000);
        })
        .error(function  () {
            spinner.stopSpinner();
            $scope.message = 'Error in sending request, please try again later';
            $scope.type = 'alert-error';
            $timeout(function() {
                $scope.message = '';
                $scope.type = '';
            }, 5000); 
        });
    };
})

.controller('requestCtrl', function () {

});