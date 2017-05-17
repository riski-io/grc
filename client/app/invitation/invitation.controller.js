'use strict';

angular.module('grcApp').controller('InvitationCtrl', function($scope , spinner , $stateParams , $http) {
	if ($stateParams.invitationId) {
		spinner.startSpinner();
		$http.get('/api/organisation-units/verify-org-invitation/'+ $stateParams.invitationId)
		.success(function (data) {
			spinner.stopSpinner();
			$scope.invitation = data;
		})
		.error(function () {
			spinner.stopSpinner();
			$scope.error = true;
		});
	}
});