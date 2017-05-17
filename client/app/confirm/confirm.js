'use strict';

angular.module('grcApp').controller('CustomConfirmDialogCtrl', function($scope, $uibModalInstance, data) {
  $scope.data = data;
  $scope.msg = data.msg || 'Are you sure?';
  $scope.title = data.title || 'Confirm Removing';
  $scope.submitBtn = data.submitBtn || {value: 'Remove', class: 'btn-danger'};
  $scope.yes = function() {
    $uibModalInstance.close(true);
  };
  $scope.no = function() {
    $uibModalInstance.close(false);
  };
});
