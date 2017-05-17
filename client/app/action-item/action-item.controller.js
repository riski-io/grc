'use strict';
/* global angular */
angular.module('grcApp').controller('ActionItemCtrl', function($scope, actionItemsStatuses, actionItemPriorities, spinner) {
  spinner.startSpinner();
  $scope.actionItemStatuses = actionItemsStatuses;
  $scope.actionItemPriorities = actionItemPriorities;
}).controller('ActionViewCtrl', function($scope, $stateParams, $state, $sce, ActionItem, notify, notifyTemplate, dialogs, spinner) {
  if ($stateParams.actionItemId && $stateParams.actionItemId !== 'new') {
    $scope.actionItem = ActionItem.get({
      id: $stateParams.actionItemId
    }, function() {
      spinner.stopSpinner();
      $scope.description = $sce.trustAsHtml($scope.actionItem.description);
      $scope.actionRequired = $sce.trustAsHtml($scope.actionItem.actionRequired);
    });
    $scope.removeActionItem = function(entityId) {
      var dialog = dialogs.create('app/confirm/confirm.html', 'CustomConfirmDialogCtrl', {}, {
        size: 'md',
        keyboard: true,
        backdrop: true
      });
      dialog.result.then(function(result) {
        if (result) {
          spinner.startSpinner();
          ActionItem.remove({
            id: entityId
          }).$promise.then(function() {
            $state.go('action-item.list');
            notify({
              message: 'Action Item ' + entityId + ' has been removed',
              classes: 'alert-info',
              templateUrl: notifyTemplate
            });
          });
        }
      });
    };
  }
}).controller('ActionItemEditCtrl', function($scope, $stateParams, $state, $sce, ActionItem, Review, Control, RestService, authService, notify, notifyTemplate, Users, WysiwygConfig, spinner) {
  spinner.startSpinner();
  $scope.users = Users.getAllUsers();
  $scope.addedMember = {};
  $scope.wysiwygConfig = WysiwygConfig;
  if ($state.is('action-item.edit')) {
    $scope.actionItem = ActionItem.get({
      id: $stateParams.actionItemId
    }, function() {
      if ($scope.actionItem.dueDate) {
        $scope.actionItem.dueDate = new Date( $scope.actionItem.dueDate);
      }
      spinner.stopSpinner();
    });
  }
  if ($state.is('action-item.new')) {
    spinner.stopSpinner();
  }

  function getOrgUnit(refEntityId, refEntityType, callback) {
    if (refEntityType === 'record') {
      RestService.record.get({
        id: refEntityId
      }).$promise.then(function(result) {
        var orgUnit = {};
        if (result.responsibleOrg) {
          orgUnit = result.responsibleOrg;
        }
        callback(orgUnit);
      }, function() {
        callback({});
      });
    } else if (refEntityType === 'review') {
      Review.get({
        id: refEntityId
      }).$promise.then(function(result) {
        var orgUnit = {};
        if (result.responsibleOrg) {
          orgUnit = result.responsibleOrg;
        }
        callback(orgUnit);
      }, function() {
        callback({});
      });
    } else if (refEntityType === 'control') {
      Control.get({
        id: refEntityId
      }).$promise.then(function(result) {
        var orgUnit = {};
        if (result.responsibleOrg) {
          orgUnit = result.responsibleOrg;
        }
        callback(orgUnit);
      }, function() {
        callback({});
      });
    }else{
      callback({});
    }
  }
  $scope.saveActionItem = function(form) {
    $scope.actionItemSubmitted = true;
    if (form.$valid) {
      spinner.startSpinner();
      window.scrollTo(0, 0);
      if ($stateParams.actionItemId && $stateParams.actionItemId !== 'new') {
        getOrgUnit($scope.actionItem.refEntityId, $scope.actionItem.refEntityType, function (orgUnit) {
          $scope.actionItem.responsibleOrg = orgUnit;
          ActionItem.update({
            id: $stateParams.actionItemId
          }, angular.copy($scope.actionItem)).$promise.then(function() {
            $state.go('action-item.view', {
              actionItemId: $stateParams.actionItemId
            });
          }, function() {
            spinner.stopSpinner();
          });
        });
      } else {
        $scope.actionItem.refEntityType = $scope.actionItem.refEntityType || $stateParams.refEntityType;
        $scope.actionItem.refEntityId = $scope.actionItem.refEntityId || $stateParams.refEntityId;
        getOrgUnit($scope.actionItem.refEntityId, $scope.actionItem.refEntityType, function (orgUnit) {
          $scope.actionItem.responsibleOrg = orgUnit;
          ActionItem.save(angular.copy($scope.actionItem)).$promise.then(function(result) {
            $state.go('action-item.view', {
              actionItemId: result._id
            });
            spinner.stopSpinner();
          }, function() {
            spinner.stopSpinner();
          });
        });
      }
    } else {
      if (form.$error.required) {
        notify({
          message: 'Please fill all required fields',
          classes: 'alert-danger',
          templateUrl: notifyTemplate
        });
        window.scrollTo(0, 0);
      }
    }
  };
}).controller('ActionItemRelatedEntityCtrl', function($scope, $state, $stateParams, Review, Control, RestService, notify, notifyTemplate) {
  var entityId = '';
  var entityType = '';
  var entityTitle = '';
  $scope.loadingEntityTitle = false;
  if ($stateParams.refEntityType || $stateParams.refEntityId) {
    $scope.actionItem = {
      refEntityType: $stateParams.refEntityType,
      refEntityId: $stateParams.refEntityId
    };
  }

  function showNotification(type, message) {
    notify({
      message: message,
      classes: 'alert-' + type,
      templateUrl: notifyTemplate
    });
  }
  $scope.showEntityTitle = function(form) {
    $scope.relatedEntitySubmitted = true;
    if (form.$valid) {
      if ((entityId === $scope.actionItem.refEntityId) && (entityType === $scope.actionItem.refEntityType)) {
        showNotification('info', entityTitle);
      } else {
        notify.closeAll();
        $scope.loadingEntityTitle = true;
        entityId = $scope.actionItem.refEntityId;
        entityType = $scope.actionItem.refEntityType;
        switch (entityType) {
          case 'review':
            Review.get({
              id: entityId
            }).$promise.then(function(result) {
              entityTitle = result.title;
              showNotification('info', entityTitle);
              $scope.loadingEntityTitle = false;
            }, function() {
              showNotification('danger', 'Review not found');
              entityId = '';
              entityType = '';
              $scope.loadingEntityTitle = false;
            });
            break;
          case 'control':
            Control.get({
              id: entityId
            }).$promise.then(function(result) {
              entityTitle = result.title;
              showNotification('info', entityTitle);
              $scope.loadingEntityTitle = false;
            }, function() {
              showNotification('danger', 'Control not found');
              entityId = '';
              entityType = '';
              $scope.loadingEntityTitle = false;
            });
            break;
          case 'record':
            RestService.record.get({
              id: entityId
            }).$promise.then(function(result) {
              entityTitle = result.title;
              showNotification('info', entityTitle);
              $scope.loadingEntityTitle = false;
            }, function() {
              showNotification('danger', 'Record not found');
              entityId = '';
              entityType = '';
              $scope.loadingEntityTitle = false;
            });
            break;
          default:
            entityTitle = '';
            break;
        }
      }
    } else {
      showNotification('danger', 'Please fill related entity fields');
      entityId = '';
    }
  };
}).controller('ActionItemListCtrl', function($scope, $state, $filter, ActionItem, DTOptionsBuilder, DTColumnDefBuilder, $location, OrgUnits, $rootScope, Search, FileSaveService, spinner) {
  $scope.includeChildren = false;
  $scope.orgUnit = {};
  $scope.filters = {};

  $scope.$watch(function() {
    return $rootScope.orgTree;
  }, function() {
    if ($rootScope.orgTree) {
      $rootScope.listFilters = $rootScope.listFilters || {};
      $scope.orgUnit = $rootScope.orgTree[0];
      $scope.orgTree = $rootScope.orgTree;
      spinner.startSpinner();
      $scope.data = {};
      $scope.query = '';
      $scope.data.query = '';
      $scope.noOfRows = 10;
      $scope.data.currentPage = $location.hash() || 1;
      $scope.itemsPerPage = 10;
      if ($rootScope.listFilters.actionItem) {
        $scope.orgUnit = $rootScope.listFilters.actionItem.orgUnit;
        $scope.includeChildren = $rootScope.listFilters.actionItem.includeChildren;
      }
      $scope.getResults();
    }
  }, true);

    $scope.exportAsCSV = function () {
      var url= '/api/action-items/filter/'+$scope.orgUnit.orgUnitId+'?csv=true&?children='+$scope.includeChildren, children;
      if ($scope.includeChildren) {
        children = OrgUnits.getChidlren($scope.orgUnit);
      }
      FileSaveService.exportAsCSV(url, 'action-items', 'POST', {children : children});
    };

    $scope.getResults = function (bResetFacet) {
        $location.hash($scope.data.currentPage);
        var unit = {
          $modelValue : $scope.orgUnit
        };
        $scope.updateSearchResults(unit, bResetFacet);
    };

    $scope.refreshItemsPerPage = function(items, bResetFacet){
      if (items === 'all') {
        $scope.itemsPerPage = $scope.result.hits.found;
      }else{
        $scope.itemsPerPage = Number(items);
      }
      if ($scope.itemsPerPage <= $scope.result.hits.found) {
        $scope.data.currentPage = 1;
        $scope.getResults(bResetFacet);
      }
    };

    $scope.updateSearchResults = function(scope, bResetFacet) {
      scope = scope || {};
      spinner.startSpinner();
      var aggregations = false;
      var orgUnit = scope.$modelValue;
      if (orgUnit) {
        $scope.orgUnit = orgUnit;
        $('#heirarchy').modal('hide');
      }
      $scope.filters.orgUnitId = $scope.orgUnit.orgUnitId ;
      $scope.filters.includeChildren = $scope.includeChildren;
      if (bResetFacet) {
        aggregations = {
          'status': {
            'terms': {
              'field': 'STATUS',
              'size': 10
            }
          },
          'Priority': {
            'terms': {
              'field': 'PRIORITY',
              'size': 10
            }
          },
          'reviewType': {
            'terms': {
              'field': 'REVIEW_TYPE',
              'size': 10
            }
          },
          'refEntityType':{
            'terms':{
              'field' : 'REF_ENTITY_TYPE',
              'size' : 10
            }
          }
        };
      }
      var data = {
        query: $scope.data.query,
        params : {
          type : 'ACTIONITEM',
          size : $scope.itemsPerPage,
          start: (($scope.data.currentPage - 1) * $scope.itemsPerPage)
        },
        body : {
          aggregations : aggregations,
          filters : $scope.filters
        }
      };
      $rootScope.listFilters.record = {
        orgUnit : $scope.orgUnit,
        includeChildren : $scope.includeChildren
      };
      Search.get(data)
      .then(function (res) {
        var result = res.data;
        $scope.result = result;
        if (aggregations) {
          $scope.facets = result.aggregations;
        }
        spinner.stopSpinner();
      }).catch(function () {
        spinner.stopSpinner();
      });
    };

  $scope.dtOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withBootstrap()
  .withOption('bFilter', false)
  .withOption('bLengthChange', false)
  .withOption('iDisplayLength', 100000);

  $scope.dtColumnDefs = [
    DTColumnDefBuilder.newColumnDef(0).withOption('defaultContent', '').withOption('sType', 'entityid'), //ReviewId
    DTColumnDefBuilder.newColumnDef(1).withOption('defaultContent', ''), //Title
    DTColumnDefBuilder.newColumnDef(2).withOption('defaultContent', ''), //Status
    DTColumnDefBuilder.newColumnDef(3).withOption('defaultContent', ''), //Priority
    DTColumnDefBuilder.newColumnDef(4).renderWith(function(data, type) {
      if (type === 'sort' || type === 'type') {
        return data;
      }
      if (type === 'display' || type === 'filter') {
        return $filter('date')(data, 'dd-MMM-yyyy');
      }
    }).withOption('sType', Date.parse()).withOption('className', 'date-column'), //Due Date
    DTColumnDefBuilder.newColumnDef(5).withOption('defaultContent', ''), //Created By
    DTColumnDefBuilder.newColumnDef(6).withOption('defaultContent', '') //Assigned To
  ];
  $scope.goToActionItem = function(actionItemId) {
    $state.go('action-item.view', {
      actionItemId: actionItemId
    });
  };

}).controller('RelatedActionItemListCtrl', function($scope, $state, $stateParams, ActionItem) {
  $scope.relatedActionItemsIsLoading = true;
  $scope.refEntityId = null;
  var param = {}
  if ($stateParams.reviewId) {
    param = {
      refEntityId: $stateParams.reviewId,
      refEntityType: 'review'
    }
  }
  if ($stateParams.recordId) {
    param = {
      refEntityId: $stateParams.recordId,
      refEntityType: 'record'
    }
  }
  if ($stateParams.controlId) {
    param = {
      refEntityId: $stateParams.controlId,
      refEntityType: 'control'
    }
  }

  if ($scope.refEntityId) {
    ActionItem.query(param).$promise.then(function(collection) {
      $scope.loadingText = 'Loading associated action items...';
      $scope.relatedActionItems = collection;
      $scope.relatedActionItemsIsLoading = false;
    });
  } else {
    $scope.relatedActionItems = [];
    $scope.relatedActionItemsIsLoading = false;
  }
  $scope.goToActionItem = function(actionItemId) {
    $state.go('action-item.view', {
      actionItemId: actionItemId
    });
  };
});