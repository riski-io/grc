'use strict';

angular.module('grcApp').controller('SettingsCtrl', function($scope, Settings, dialogs, $timeout) {

  function updateSettingsList() {
    $timeout(function() {
      $scope.isLoading = true;
      Settings.list(function(data) {
        $scope.settings = data.settings;
        $scope.config = JSON.stringify(data.config, null, 2);
        $scope.isLoading = false;
      });
    });
  }
  updateSettingsList();
  $scope.edit = function(item) {
    var dialog = dialogs.create('app/admin/settings/settings.edit.dialog.html', 'EditSettingsDialogCtrl', {item: angular.copy(item)}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function() {
      updateSettingsList();
    });
  };
});

angular.module('grcApp').controller('EditSettingsDialogCtrl', function($scope, $uibModalInstance, Settings, $timeout, data) {
  $scope.item = data.item;

  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };
  $scope.save = function() {
    Settings.update({key: $scope.item.key}, angular.copy($scope.item), function() {
      $scope.type = 'alert-success';
      $scope.message = 'Settings successfuly saved';
      $timeout(function() {
        $uibModalInstance.close();
      }, 2000);
    }, function() {
      $scope.type = 'alert-danger';
      $scope.message = 'Cant update settings. Please try again later.';
    });
  };
});
