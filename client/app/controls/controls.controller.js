'use strict';
/* global angular */

angular.module('grcApp').controller('controlsCtrl', function($scope, $state, EnumItems, OrgUnits) {
  $scope.enums = EnumItems.getAllItems();
  $scope.orgUnits = OrgUnits.getAllUnits();
});
function controlIdToInt(str) {
  if (_.isEmpty(str)) {
    return null;
  }
  var idPart = str.substr(2);
  var result = 0;
  try {
    result = parseInt(idPart);
  } catch (e) {
    //
  }
  return result;
}
angular.module('grcApp').controller('controlsViewCtrl', function($scope, $stateParams, $state, $sce, Control, GovernanceRecord, dialogs, notify, notifyTemplate) {

  $scope.control = {};
  $scope.isLoading = true;
  $scope.isLoadingControlRecords = true;
  $scope.descriptionHtmlSafe = '';

  Control.listAll(function(collection) {
    $scope.allControls = _.chain(collection).filter(function(item) {
      return item.controlId !== $stateParams.controlId;
    }).sortBy(function(item) {
      return controlIdToInt(item.controlId);
    }).value();
  });

  $scope.openMergeControlDialog = function() {
    var dialog = dialogs.create('app/controls/merge.control.dialog.html', 'MergeControlDialogCtrl', {baseControl: $scope.control, mergeControl: $scope.mergeControl}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function() {
    });
  };
  if ($stateParams.controlId && $stateParams.controlId !== 'new') {
    $scope.control = Control.get({id: $stateParams.controlId}, function() {
      $scope.isLoading = false;
      $scope.descriptionHtmlSafe = $sce.trustAsHtml($scope.control.description);
    });

    GovernanceRecord.get({'assessment.controls': $stateParams.controlId}, function(result) {
      $scope.impactedRecords = result;
      $scope.control = $scope.control || {};
      $scope.isLoadingControlRecords = false;
    });


    $scope.removeControl = function(entityId){
      var dialog = dialogs.create('app/confirm/confirm.html', 'CustomConfirmDialogCtrl', {}, {size: 'md', keyboard: true, backdrop: true});
      dialog.result.then(function(result) {
        if (result) {
          $scope.isLoading = true;
          Control.remove({ id: entityId}).$promise.then(function () {
            $state.go('control.list_all');
            notify({
              message:'Control ' + entityId + ' has been removed',
              classes: 'alert-info',
              templateUrl: notifyTemplate
            });
          });
        }
      });
    };


  } else {
    $state.go('control.list_all');
  }
});

angular.module('grcApp').controller('MergeControlDialogCtrl', function($scope, $uibModalInstance, $timeout, Control, data) {
  $scope.baseControl = data.baseControl;
  $scope.mergeControl = data.mergeControl;
  $scope.cancel = function() {
    $uibModalInstance.dismiss();
  };
  $scope.isProcessing = false;
  $scope.isCompleted = false;
  $scope.merge = function() {
    $scope.isProcessing = true;
    Control.merge({id: $scope.baseControl.controlId, action : 'merge'}, {mergeControlId: $scope.mergeControl.controlId}, function(result) {
      $scope.type = 'alert-success';
      $scope.message = 'Controls successfuly merged.';
      $scope.isCompleted = true;
      $scope.isProcessing = false;
      $timeout(function() {
        $uibModalInstance.close(result);
      }, 2000);
    }, function(result) {
      $scope.isProcessing = false;
      $scope.type = 'alert-danger';
      $scope.message = 'Can\'t merge controls: ' + result.data.message;
    });
  };

});

angular.module('grcApp').controller('controlsEditCtrl', function($scope, $stateParams, $state, RestService, Control, GovernanceRecord, Users, notify, notifyTemplate, authService, WysiwygConfig) {
  $scope.users = Users.getAllUsers();
  $scope.currentUser = authService.getCurrentUser();
  $scope.wysiwygConfig = WysiwygConfig;
  $scope.control = {};
  $scope.isLoading = true;
  $scope.isLoadingControlRecords = true;
  $scope.tagString = {value: ''}; // causes a weird behavior if we use just string
  $scope.statuses = ['New', 'Planned', 'Active', 'Ineffective', 'Retired'];
  if ($state.is('control.edit')) {
    if ($stateParams.controlId) {
      $scope.control = Control.get({id: $stateParams.controlId}, function() {
        if ($scope.control.tag && $scope.control.tag.length) { // ?? or is this field mandatory?
          $scope.tagString.value = $scope.control.tag.join(',');
        }
        if ($scope.control.effectiveTo) {
          $scope.control.effectiveTo = new Date($scope.control.effectiveTo);
        }
        if ($scope.control.effectiveFrom) {
          $scope.control.effectiveFrom = new Date($scope.control.effectiveFrom);
        }
        $scope.isLoading = false;
      });
      GovernanceRecord.query({'assessment.controls': $stateParams.controlId}, function(result) {
        $scope.impactedRecords = result;
        $scope.isLoadingControlRecords = false;
      });

    } else {
      $state.go('control.list_all');
    }

  } else if ($state.is('control.new')) {
    $scope.isLoadingControlRecords = false;
    $scope.control = new RestService.control();
    angular.extend($scope.control, {
      'title': '',
      'status': '',
      'responsibleOrg': '',
      'responsibleUser': '',
      'category': '',
      'tag': [],
      'description': '',
      'effectiveFrom': '',
      'effectiveTo': ''
    });
    $scope.isLoading = false;
  }

  $scope.updateSearchResults = function (scope) {
    scope = scope || {};
    var orgUnit = scope.$modelValue;
    if (orgUnit) {
      $scope.control.responsibleOrg = orgUnit;
      $('#heirarchy').modal('hide');
    }
  };

  $scope.setTags = function() {
    $scope.control.tag = $scope.tagString.value.split(',');
  };

  $scope.saveControl = function(form) {
    $scope.controlSubmitted = true;
    if (form.$valid) {
      $scope.isLoading = true;
      window.scrollTo(0, 0);

      if ($stateParams.controlId) {
        Control.update({id: $stateParams.controlId}, angular.copy($scope.control)).$promise.then(function() {
          $state.go('control.view', {controlId: $stateParams.controlId});
        }, function(errResponse) {
          $scope.isLoading = false;
          console.error(errResponse);
        });
      } else {
        Control.save(angular.copy($scope.control)).$promise.then(function(result) {
          $state.go('control.view', {controlId: result._id});
        }, function(errResponse) {
          $scope.isLoading = false;
          console.error(errResponse);
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

});

angular.module('grcApp').controller('controlsListCtrl', function($scope, $state, $filter, Control, FileSaveService, DTOptionsBuilder, DTColumnDefBuilder, $rootScope, OrgUnits, $location, Search) {
  $scope.isLoading = true;
  $scope.filters = {};

    $scope.$watch(function() {
      return $rootScope.orgTree;
    }, function() {
      if ($rootScope.orgTree) {
        $rootScope.listFilters = $rootScope.listFilters || {};
        $scope.orgUnit = $rootScope.orgTree[0];
        $scope.orgTree = $rootScope.orgTree;
        $scope.data = {};
        $scope.data.query = '';
        $scope.data.currentPage = $location.hash() || 1;
        $scope.itemsPerPage = 10;
        $scope.noOfRows = 10;
        if ($rootScope.listFilters.control) {
          $scope.orgUnit = $rootScope.listFilters.control.orgUnit;
          $scope.includeChildren = $rootScope.listFilters.control.includeChildren;
        }
        $scope.getResults(true);
      }
    }, true);


    $scope.exportAsCSV = function () {
      var url= '/api/controls/filter/'+$scope.orgUnit.orgUnitId+'?csv=true&?children='+$scope.includeChildren, children;
      if ($scope.includeChildren) {
        children = OrgUnits.getChidlren($scope.orgUnit);
      }
      FileSaveService.exportAsCSV(url, 'controls', 'POST', {children : children});
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
      $scope.isLoading = true;
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
          'category': {
            'terms': {
              'field': 'CATEGORY',
              'size': 10
            }
          }
        };
      }
      var data = {
        query: $scope.data.query,
        params : {
          type : 'CONTROL',
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
        $scope.isLoading = false;
      }).catch(function () {
        $scope.isLoading = false;
      });
    };
    $scope.toggle = function(scope) {
      scope.toggle();
    };

  $scope.dtOptions = DTOptionsBuilder.newOptions()
    .withOption('bFilter', false)
    .withOption('bLengthChange', false)
    .withOption('iDisplayLength', 100000)
    .withPaginationType('full_numbers')
    .withBootstrap();

  $scope.dtColumnDefs = [
    DTColumnDefBuilder.newColumnDef(0).withOption('defaultContent', '').withOption('sType', 'entityid'), //ReviewId
    DTColumnDefBuilder.newColumnDef(1).withOption('defaultContent', ''), //Title
    DTColumnDefBuilder.newColumnDef(2).withOption('defaultContent', ''), //Category
    DTColumnDefBuilder.newColumnDef(3).withOption('defaultContent', ''), //Status
    DTColumnDefBuilder.newColumnDef(4).renderWith(function(data, type) {
      if (type === 'sort' || type === 'type') {
        return data;
      }
      if (type === 'display' || type === 'filter') {
        return  $filter('date')(data, 'dd-MMM-yyyy');
      }
    }).withOption('sType', Date.parse()).withOption('className', 'date-column'), //Effective from
    DTColumnDefBuilder.newColumnDef(5).renderWith(function(data, type) {
      if (type === 'sort' || type === 'type') {
        return data;
      }
      if (type === 'display' || type === 'filter') {
        return  $filter('date')(data, 'dd-MMM-yyyy');
      }
    }).withOption('sType', Date.parse()).withOption('className', 'date-column'), //Effective to
    DTColumnDefBuilder.newColumnDef(6).withOption('defaultContent', ''), //Resp. Org
    DTColumnDefBuilder.newColumnDef(7).withOption('defaultContent', ''), //Resp. User
    DTColumnDefBuilder.newColumnDef(8).renderWith(function(data, type) {
      if (type === 'sort' || type === 'type') {
        return data;
      }
      if (type === 'display' || type === 'filter') {
        return  $filter('date')(data, 'dd-MMM-yyyy');
      }
    }).withOption('sType', Date.parse()).withOption('className', 'date-column') //Last update
  ];

  $scope.goToControl = function(contrId) {
    $state.go('control.view', {controlId: contrId});
  };


});