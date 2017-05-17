'use strict';

angular.module('grcApp').controller('PermissionsCtrl', function($scope, Permissions, dialogs , spinner, EnumItems) {
  $scope.roles = [
    {title: 'Member', code: 'member'},
    {title: 'Manager', code: 'manager'},
    {title: 'Admin', code: 'admin'}
  ];
  $scope.permissions = [
    {title: 'Create', code: 'create'},
    {title: 'View', code: 'view'},
    {title: 'Edit', code: 'edit'},
    {title: 'Delete', code: 'delete'},
    {title: 'Comment', code: 'comment'}
  ];
  var enums = EnumItems.getAllItems();

  $scope.save = function() {
    spinner.startSpinner();
    Permissions.update({}, angular.copy($scope.pages), function() {
      $scope.type = 'alert-success';
      $scope.message = 'Permissions successfully updated';
      $scope.errors = [];
      $('html, body').animate({scrollTop: 0}, 800);
      spinner.stopSpinner();
    }, function(result) {
      $scope.type = 'alert-danger';
      $scope.message = 'Cant update permissions. Please try again later. ' + result.data;
      $scope.errors = [];
      $('html, body').animate({scrollTop: 0}, 800);
      spinner.stopSpinner();
    });
  };

  function updatePermissionsList() {
    spinner.startSpinner();
    $scope.pages = Permissions.query({list : true}, function() {
      spinner.stopSpinner();
    });
  }
  updatePermissionsList();
  $scope.edit = function(item) {
    var dialog = dialogs.create('app/admin/permissions/permissions.edit.dialog.html', 'EditPermissionsDialogCtrl', {item: angular.copy(item)}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function() {
      updatePermissionsList();
    });
  };
});

angular.module('grcApp').controller('EditPermissionsDialogCtrl', function($scope, $uibModalInstance, Settings, $timeout, data) {
  $scope.item = data.item;

  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };
  $scope.save = function() {
    Settings.update({key: $scope.item.key}, angular.copy($scope.item), function() {
      $scope.type = 'alert-success';
      $scope.message = 'Permissions successfuly saved';
      $timeout(function() {
        $uibModalInstance.close();
      }, 2000);
    }, function() {
      $scope.type = 'alert-danger';
      $scope.message = 'Cant update permissions. Please try again later.';
    });
  };
});
