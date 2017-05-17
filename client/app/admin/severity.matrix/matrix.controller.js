'use strict';

angular.module('grcApp').controller('MatrixCtrl', function($scope, EnumItem, Matrix, dialogs, spinner) {

  function updateRiskCategoryList() {
    spinner.startSpinner();
    EnumItem.query({key: 'risk_category'}, function(result) {
      $scope.items = result;
      Matrix.query({}, function(result) {
        spinner.stopSpinner();
        if (!result || !result.length) {
          return;
        }
        var items = _.groupBy(result, 'itemId');
        _.each(items, function(values, id) {
          items[id] = _.keyBy(values, 'rating');
        });
        $scope.matrixItems = items;
      });
    });
  }
  updateRiskCategoryList();
  $scope.editMatrixItem = function(item, rating, matrixItem) {
    var dialog = dialogs.create('app/admin/severity.matrix/matrix.edit.item.dialog.html', 'EditMatrixItemDialogCtrl', {item: item, rating: rating, matrixItem: matrixItem}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      if (result) {
        if (!$scope.matrixItems[item.id]) {
          $scope.matrixItems[item.id] = {};
        }
        $scope.matrixItems[item.id][rating] = result;
        angular.copy(result, matrixItem);
      }
    });
  };
  $scope.removeMatrixItem = function(item, rating) {
    var dialog = dialogs.create('app/confirm/confirm.html', 'CustomConfirmDialogCtrl', {}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      if (result) {
        Matrix.remove({itemId: item.id, rating: rating}, function() {
          delete $scope.matrixItems[item.id][rating];
        });
      }
    });
  };
});

angular.module('grcApp').controller('EditMatrixItemDialogCtrl', function($scope, $uibModalInstance, Matrix, $timeout, data) {
  $scope.item = data.item;
  $scope.rating = data.rating;
  $scope.matrixItem = data.matrixItem || {};

  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };
  $scope.save = function() {
    if (!$scope.matrixItem.description) {
      $scope.type = 'alert-danger';
      $scope.message = 'Description cannot be blank';
      return;
    }
    var handleSuccess = function(result) {
      $scope.type = 'alert-success';
      $scope.message = 'Settings successfuly saved';
      $timeout(function() {
        $uibModalInstance.close(result);
      }, 2000);
    };
    var handleFail = function() {
      $scope.type = 'alert-danger';
      $scope.message = 'Cant update settings. Please try again later.';
    };
    if (data.matrixItem) {
      Matrix.update({itemId: $scope.item.id, rating: $scope.rating}, angular.copy($scope.matrixItem), handleSuccess, handleFail);
    } else {
      Matrix.save({itemId: $scope.item.id, rating: $scope.rating}, angular.copy($scope.matrixItem), handleSuccess, handleFail);
    }
  };
});
