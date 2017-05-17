'use strict';

angular.module('grcApp').controller('ReferenceCtrl', function($scope, Enum, EnumItem, dialogs, $timeout) {

  function fetchReferenceList() {
    Enum.query().$promise.then(function (concepts) {
      EnumItem.query().$promise.then(function (collection) {
          const groups = _.groupBy(collection, 'key');
          _.map(concepts, function(concept) {
            concept.items = groups[concept.key];
          });
          $scope.concepts  = concepts;
      });
    });
  }

  $scope.onUpdateSortable = function(concept) {
    return function() {
      var data = angular.copy(concept);
      data.items = _.map(angular.copy(data.items), function(item, index) {
        item.pos = index;
        return item;
      });
      EnumItems.updateItems({uid: data.uid}, data);
    };
  };
  fetchReferenceList();
  $scope.editConcept = function(concept) {
    var dialog = dialogs.create('app/admin/reference/reference.edit.dialog.html', 'EditConceptDialogCtrl', {concept: angular.copy(concept)}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      if (concept) {
        angular.copy(result, concept);
      } else {
        fetchReferenceList();
      }
    });

  };
  $scope.editConceptItem = function(concept, item) {
    var dialog = dialogs.create('app/admin/reference/reference.edit.item.dialog.html', 'EditConceptItemDialogCtrl', {concept: concept, item: item}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      angular.copy(result, concept);
    });
  };
  $scope.removeConceptItem = function(concept, item) {
    var dialog = dialogs.create('app/confirm/confirm.html', 'CustomConfirmDialogCtrl', {}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      if (result) {

        EnumItems.deleteItem({key: concept.key, id: item.id}, function() {
          var index = concept.items.indexOf(item);
          if (index !== 1) {
            concept.items.splice(index, 1);
          }
        });
      }
    });
  };
});

angular.module('grcApp').controller('EditConceptDialogCtrl', function($scope, $uibModalInstance, Enum, EnumItem, $timeout, $rootScope, data) {

  $scope.concept = data.concept || {};
  $scope.isEdit = !!$scope.concept.key;
  var isUpdated = false;

  $scope.cancel = function() {
    if (isUpdated) {
      $uibModalInstance.close($scope.concept);
    } else {
      $uibModalInstance.dismiss();
    }
  };
  $scope.save = function() {
    var handleSuccess = function() {
      $scope.type = 'alert-success';
      $scope.message = 'Concept successfully saved';
      isUpdated = true;
      $timeout(function() {
        $uibModalInstance.close($scope.concept);
      }, 2000);
    };
    var handleFail = function() {
      $scope.type = 'alert-danger';
      $scope.message = 'Cant update concept. Please try again later.';
    };
    if ($scope.isEdit) {
      Enum.update({key: $scope.concept.key}, angular.copy($scope.concept), handleSuccess, handleFail);
    } else {
      Enum.save(angular.copy($scope.concept), handleSuccess, handleFail);
    }
  };
});

angular.module('grcApp').controller('EditConceptItemDialogCtrl', function($scope, $uibModalInstance, Enum, $timeout, $rootScope, data) {

  $scope.concept = data.concept;
  $scope.item = data.item || {};
  if ($scope.item.id) {
    $scope.isEdit = true;
  }

  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };
  $scope.save = function() {
    var handleSuccess = function(result) {
      $scope.type = 'alert-success';
      $scope.message = 'Concept entry successfuly saved';
      if (!$scope.concept.items) {
        $scope.concept.items = [];
      }
      if ($scope.isEdit) {
        var index = $scope.concept.items.indexOf(data.item);
        $scope.concept.items[index] = result;
      } else {
        $scope.concept.items.push(result);
      }
      $timeout(function() {
        $uibModalInstance.close($scope.concept);
      }, 2000);
    };
    var handleFail = function() {
      $scope.type = 'alert-danger';
      $scope.message = 'Cant update concept entry. Please try again later.';
    };
    if ($scope.isEdit) {
      Enum.updateItem({key: $scope.concept.key, id: $scope.item.id}, angular.copy($scope.item), handleSuccess, handleFail);
    } else {
      Enum.createItem({key: $scope.concept.key}, angular.copy($scope.item), handleSuccess, handleFail);
    }

  };
});
