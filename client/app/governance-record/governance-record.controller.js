'use strict';
/* global angular */

angular.module('grcApp')
  .controller('gRecordCtrl', function($scope, $state, EnumItems, OrgUnits, dialogs, notify, notifyTemplate) {
    $scope.isLoading = true;
    $scope.enums = EnumItems.getAllItems();

    $scope.showLegend = function(key, code) {
      dialogs.create('app/governance-record/legend.show.dialog.html', 'ShowLegendDialogCtrl', {key: key, code: code}, {size: 'lg', keyboard: true, backdrop: true});
    };

    $scope.showRiskMatrixLegend = function(category, rating) {
      if (category.length) {
        notify.closeAll();
        dialogs.create('app/governance-record/matrix.show.dialog.html', 'ShowRiskMatrixDialogCtrl', {category: category, rating: rating}, {size: 'lg', keyboard: true, backdrop: true});
      } else {
        notify({
          message: 'You must choose a risk category before you can choose a consequence value',
          classes: 'alert-warning',
          templateUrl: notifyTemplate
        });
      }
    };
  })

  .controller('gRecordViewCtrl', function($scope, $stateParams, $state, $sce, GovernanceRecord, notify, notifyTemplate, dialogs) {

    $scope.record = {};
    $scope.selectedCtrls = [];
    $scope.showResults = 0;
    $scope.htmlSafe = {
      description: '',
      externalFactors: [],
      risk: []
    };

    if ($stateParams.recordId) {
      $scope.record = GovernanceRecord.get({id: $stateParams.recordId}, function() {
        angular.forEach($scope.record.assessment, function(item, i) {
          if (item.controls.length) {
            $scope.selectedCtrls[i] = [];
            angular.forEach(item.controls, function(item) {
              $scope.selectedCtrls[i].push(item.control);
            });
          }
        });
        $scope.htmlSafe.description = $sce.trustAsHtml($scope.record.description);
        angular.forEach($scope.record.externalFactors, function(fctr) {
          if (fctr) {
            var hsafe = $sce.trustAsHtml(fctr.description);
            $scope.htmlSafe.externalFactors.push(hsafe);
          }

        });
        angular.forEach($scope.record.assessment, function(as) {
          var hsafe = $sce.trustAsHtml(as.risk);
          $scope.htmlSafe.risk.push(hsafe);
        });
        $scope.isLoading = false;
      });

      $scope.removeGovernanceRecord = function(entityId) {
        var dialog = dialogs.create('app/confirm/confirm.html', 'CustomConfirmDialogCtrl', {}, {size: 'md', keyboard: true, backdrop: true});
        dialog.result.then(function(result) {
          if (result) {
            $scope.isLoading = true;
            GovernanceRecord.remove({id: entityId}).$promise.then(function() {
              $state.go('governance-record.list_all');
              notify({
                message: 'Record ' + entityId + ' has been removed',
                classes: 'alert-info',
                templateUrl: notifyTemplate
              });
            });
          }
        });
      };
    } else {
      $state.go('governance-record.list_all');
    }

  })

  .controller('gRecordEditCtrl', function($scope, $stateParams, $state, spinner, $timeout, RestService, Users, OrgUnits, authService, WysiwygConfig, GovernanceRecord, dialogs, $uibModal, Control) {
    $scope.users = Users.getAllUsers();
    $scope.controls = RestService.control.query();
    $scope.reviews = RestService.reviews.query();
    $scope.orgUnits = OrgUnits.getAllUnits();
    $scope.currentUser = authService.getCurrentUser();
    $scope.wysiwygConfig = WysiwygConfig;
    var isIE = /*@cc_on!@*/false;
    var modalInstance;
    $scope.controlStatuses = ['New', 'Planned', 'Active', 'Ineffective', 'Retired'];
    $scope.record = {
      'assessment': [{
          'risk': '',
          'category': '',
          'initialAssessment': {
            'cost': 0,
            'consequence': 1,
            'likelihood': 1,
            'rating': 2
          },
          'controls': [],
          'controlledAssessment': {
            'cost': 0,
            'consequence': 1,
            'likelihood': 1,
            'rating': 2
          }
        }]
    };
    $scope.selectedCtrls = [];
    $scope.showResults = 0;
    $scope.overall = {
      initialRating: '',
      initialCost: '',
      controlledRating: '',
      controlledCost: '',
      targetRating: '',
      targetCost: ''
    };

    $scope.trimContents = function (text) {
      text = text.trim();
    };
      
    $scope.createControl = function (index) {
        $scope.riskIndex = index;      
        $scope.control = {
          status : 'New',
          category : $scope.record.category,
          responsibleUser : $scope.record.responsibleUser,
          responsibleOrg : $scope.record.responsibleOrg,
          effectiveFrom : new Date()
        };
        modalInstance = $uibModal.open({
            templateUrl: 'app/governance-record/control-modal.html',
            size : 'lg',
            scope:$scope,
            windowClass: 'animated fadeIn'
        });
    };

    $scope.updateSearchResults = function (scope) {
      scope = scope || {};
      var orgUnit = scope.$modelValue;
      if (orgUnit) {
        $scope.control.responsibleOrg = orgUnit;
        $('#heirarchy').modal('hide');
      }
    };

    $scope.cancel = function () {
      $scope.controlSubmitted = false;
      modalInstance.dismiss('cancel');
    };

    $scope.saveControl = function (isValid) {
        if (!isValid) {
          $scope.controlSubmitted = true;
          return;
        }
        spinner.startSpinner();
        Control.save(angular.copy($scope.control)).$promise.then(function(result) {
          var control = result;
          $scope.controls.push(control);
          $scope.addControl($scope.riskIndex, control);
          modalInstance.close();
          spinner.stopSpinner();
        }, function(errResponse) {
          $scope.isLoading = false;
          modalInstance.close();
          spinner.stopSpinner();
        });
    };

    if ($state.is('governance-record.edit')) {
      if ($stateParams.recordId) {
        $scope.controls.$promise.then(function() {
          $scope.record = GovernanceRecord.get({id: $stateParams.recordId}, function() {
            angular.forEach($scope.record.assessment, function(item, i) {
              if (item.controls.length) {
                $scope.selectedCtrls[i] = [];
                angular.forEach(item.controls, function(item) {
                  $scope.selectedCtrls[i].push(item.control);
                });
              }
            });
            if ($scope.record.externalFactors && $scope.record.externalFactors.length === 1 && !$scope.record.externalFactors[0].description) {
              $scope.record.externalFactors = [];
            }
            $scope.overall = angular.copy($scope.record.overallAssessment);
            $scope.isLoading = false;
          });
        });
      } else {
        $state.go('governance-record.list_all');
      }
    } else if ($state.is('governance-record.new')) {
      $scope.record = new RestService.record();
      angular.extend($scope.record, {
        'responsibleOrg': '',
        'title': '',
        'identifiedAt': '',
        'status': 'new',
        'updatedAt': '',
        'createdDate': '',
        'nominatedReviewer': '',
        'responsibleUser': '',
        'description': '',
        'externalFactors': [{
            'description' : '',
            'trend' : '',
            'editable' : {
              'description' : '',
              'trend' : ''
            }
          }],
        'assessment': [{
            'risk': '',
            'category': '',
            'initialAssessment': {
              'cost': '',
              'consequence': '',
              'likelihood': '',
              'rating': ''
            },
            'controls': [],
            'controlledAssessment': {
              'cost': '',
              'consequence': '',
              'likelihood': '',
              'rating': ''
            }
          }]
      });
      $scope.isLoading = false;
    }

    $scope.addFactor = function() {
      if (!$scope.record.hasOwnProperty('externalFactors')) {
        $scope.record.externalFactors = [];
      }
      $scope.record.externalFactors.push({
        description: '',
        trend: '',
        editable : {
          description: '',
          trend: '',  
        }
      });
    };

    $scope.removeFactor = function(index) {
      if (index > -1) {
        $scope.record.externalFactors.splice(index, 1);
      }
    };

    $scope.editFactor = function (factor) {
      factor.editable = {
        description : factor.description || '',
        trend : factor.trend || ''
      };
    };

    $scope.done = function (factor) {
      factor.description = factor.editable.description;
      factor.trend = factor.editable.trend;
      delete factor.editable;
    };

    $scope.resetFactor = function (factor, index) {
      if (!factor.description) {
        return $scope.record.externalFactors.splice(index, 1);
      }
      delete factor.editable;
    };

    $scope.bRiskEdit = null;
    $scope.editRisk = function (index, item) {
        $scope.bRiskEdit = index + 1;
        $scope.newRiskSubmitted = false;
        $scope.newRisk = angular.copy(item);
        modalInstance = $uibModal.open({
            templateUrl: 'app/governance-record/risk-modal.html',
            size : 'lg',
            scope:$scope,
            windowClass: 'animated fadeIn'
        });
    };

    $scope.addRisk = function() {
      $scope.newRiskSubmitted = false;
      $scope.newRisk = {
        'risk': '',
        'category': '',
        'initialAssessment': {
          'cost': 0,
          'consequence': '',
          'likelihood': '',
          'rating': ''
        },
        'controls': [],
        'controlledAssessment': {
          'cost': '',
          'consequence': '',
          'likelihood': '',
          'rating': ''
        }
      };

      modalInstance = $uibModal.open({
          templateUrl: 'app/governance-record/risk-modal.html',
          size : 'lg',
          scope:$scope,
          windowClass: 'animated fadeIn'
      });
    };

    $scope.saveRisk = function (isValid) {
      $scope.newRiskSubmitted = true;
      if (!isValid) {
        return;
      }
      $scope.newRiskSubmitted = false;
      $scope.record.assessment = $scope.record.assessment || [];
      if ($scope.bRiskEdit) {
        $scope.record.assessment[$scope.bRiskEdit - 1] = angular.copy($scope.newRisk);
      }else{
        $scope.record.assessment.push(angular.copy($scope.newRisk));
      }
      modalInstance.dismiss('cancel');
      $scope.newRisk = {};
    };


    $scope.removeRisk = function(index) {
      $scope.record.assessment = $scope.record.assessment || [];
      if (index > -1) {
        $scope.record.assessment.splice(index, 1);
      }
    };

    $scope.deleteCtrl = function(parIndex, index) {
      $scope.selectedCtrls[parIndex].splice(index, 1);
      if (!$scope.selectedCtrls[parIndex].length) {
        $scope.selectedCtrls.splice(parIndex, 1);
      }
      $scope.record.assessment[parIndex].controls.splice(index, 1);
    };
    $scope.moveCtrl = function(parIndex, index) {
      var control = $scope.selectedCtrls[parIndex][index];
      var dialog = dialogs.create('app/governance-record/move.control.dialog.html', 'MoveControlDialogCtrl', {risks: $scope.record.assessment, control: control, riskIndex: parIndex}, {size: 'lg', keyboard: true, backdrop: true});
      dialog.result.then(function(newIndex) {
        $scope.selectedCtrls[parIndex].splice(index, 1);
        if (!$scope.selectedCtrls[parIndex].length) {
          $scope.selectedCtrls.splice(parIndex, 1);
        }
        var riskControl = $scope.record.assessment[parIndex].controls[index];
        $scope.record.assessment[parIndex].controls.splice(index, 1);

        if (!$scope.record.assessment[newIndex].controls) {
          $scope.record.assessment[newIndex].controls = [];
        }
        $scope.record.assessment[newIndex].controls.push(riskControl);
        if (!$scope.selectedCtrls[newIndex]) {
          $scope.selectedCtrls[newIndex] = [];
        }
        $scope.selectedCtrls[newIndex].push(control);
      });
    };

    var minMaxFinancialValues = {
      1: [-Infinity, 1],
      2: [1, 10],
      3: [10, 50],
      4: [50, 100],
      5: [100, Infinity]
    };

    var getMinMaxFinancialValues = function(category, consequence) {
      if (!category || category.toUpperCase() !== 'FINANCIAL') {
        return [-Infinity, Infinity];
      }
      return minMaxFinancialValues[consequence] || [-Infinity, Infinity];
    };

    $scope.minFinancialImpactValue = function(category, consequence) {
      return getMinMaxFinancialValues(category, consequence)[0];
    };

    $scope.maxFinancialImpactValue = function(category, consequence) {
      return getMinMaxFinancialValues(category, consequence)[1];
    };

    $scope.saveRecord = function(form) {
      $scope.recordSubmitted = true;
      var i = 0;
      $scope.record.externalFactors = $scope.record.externalFactors || [];
      if (isIE && $scope.record.externalFactors.length) {
        var factors = $scope.record.externalFactors;
        for (i = 0; i < factors.length; i++) {
          factors[i].description = $(factors[i].description).text();
          if (factors[i].description && !factors[i].trend || !factors[i].description && factors[i].trend) {
            return;
          }
        }
      }
      for (i = 0; i < $scope.record.externalFactors.length; i++) {
        if ($scope.record.externalFactors[i].editable) {
          delete $scope.record.externalFactors[i].editable;
        }
      }
      if (form.$valid) {
        $scope.isLoading = true;
        window.scrollTo(0, 0);
        if ($stateParams.recordId) {
          $scope.record.$update({id: $stateParams.recordId}, function(res) {
            $state.go('governance-record.view', {recordId: res._id});
            $scope.recordSubmitted = false;
            $scope.isLoading = false;
          });
        } else {
          $scope.record.$save(function(res) {
            $state.go('governance-record.view', {recordId: res._id});
            $scope.recordSubmitted = false;
            $scope.isLoading = false;
          });
        }
      } else {
        $timeout(function() {
          var invalidElement = angular.element('.has-error:first');
          if (invalidElement && invalidElement.offset()) {
            $('html, body').animate({scrollTop: invalidElement.offset().top}, 800);
          }
        });
      }
    };

    function doCalc() {
      $scope.showResults = 0;
      var overallAssessment= {
        initialRating: 0,
        initialCost: 0,
        initialConsequence : 0,
        initialLikelihood : 0,
        controlledConsequence : 0,
        controlledLikelihood : 0,
        controlledRating: 0,
        controlledCost: 0,
        targetLikelihood : 0,
        targetConsequence : 0,
        targetRating: 0,
        targetCost: 0
      };
      var currentList = [];
      var currentListCost = [];
      angular.forEach($scope.record.assessment, function(as) {
        as.controlledAssessment = as.controlledAssessment || {};
        as.initialAssessment = as.initialAssessment || {};

        as.initialAssessment.rating = +as.initialAssessment.consequence + (+as.initialAssessment.likelihood);
        as.controlledAssessment.rating = +as.controlledAssessment.consequence + (+as.controlledAssessment.likelihood);
        as.controlledAssessment.cost = as.controlledAssessment.cost || 0;
        as.initialAssessment.cost = as.initialAssessment.cost || 0;
      });
      var assessments = $scope.record.assessment;
      var maxInitialRating = _.max(assessments, function(assessment) {
        if (assessment.initialAssessment) {
          return assessment.initialAssessment.rating;
        } else {
          return;
        }
      });
      var maxInitialCost = _.max(assessments, function(assessment) {
        if (assessment.initialAssessment) {
          return assessment.initialAssessment.cost;
        } else {
          return;
        }
      });

      if (maxInitialRating && maxInitialRating.initialAssessment) {
        var arr = _.filter(assessments, function(obj) {
          return obj.initialAssessment.rating === maxInitialRating.initialAssessment.rating;
        });
        if (arr && arr.length > 1) {
          maxInitialRating = _.max(arr, function(assessment) {
            return assessment.initialAssessment.likelihood;
          }); 
        }
        overallAssessment.initialRating = Number(maxInitialRating.initialAssessment.rating);
        overallAssessment.initialConsequence = Number(maxInitialRating.initialAssessment.consequence);
        overallAssessment.initialLikelihood = Number(maxInitialRating.initialAssessment.likelihood);
        overallAssessment.initialCost = Number(maxInitialCost.initialAssessment.cost);
      }
      var maxTargetRating = _.max(assessments, function(assessment) {
        if (assessment.controlledAssessment) {
          return assessment.controlledAssessment.rating;
        } else {
          return;
        }
      });
      var maxTargetCost = _.max(assessments, function(assessment) {
        if (assessment.initialAssessment) {
          return assessment.controlledAssessment.cost;
        } else {
          return;
        }
      });

      if (maxTargetRating && maxTargetRating.controlledAssessment) {
        var arrTarget = _.filter(assessments, function(obj) {
          return obj.controlledAssessment.rating === maxTargetRating.controlledAssessment.rating;
        });
        if (arrTarget && arrTarget.length > 1) {
          maxTargetRating = _.max(arrTarget, function(assessment) {
            return assessment.controlledAssessment.likelihood;
          }); 
        }
        overallAssessment.targetRating = maxTargetRating.controlledAssessment.rating;
        overallAssessment.targetConsequence = maxTargetRating.controlledAssessment.consequence;
        overallAssessment.targetLikelihood = maxTargetRating.controlledAssessment.likelihood;
        overallAssessment.targetCost = maxTargetCost.controlledAssessment.cost;
      }

      _.forEach(assessments, function(assessment) {
        if (assessment.controls && assessment.controls.length) {
          $scope.showResults++;
        }
        if (_.some(assessment.controls, {effectiveness: 'Effective'}) || _.some(assessment.controls, {effectiveness: 'Adequate'})) {
          currentList.push({
            controlledRating : assessment.controlledAssessment.rating,
            controlledConsequence : assessment.controlledAssessment.consequence,
            controlledLikelihood : assessment.controlledAssessment.likelihood
          });
          currentListCost.push(Number(assessment.controlledAssessment.cost));
        }else{
          currentList.push({
            controlledRating : assessment.initialAssessment.rating,
            controlledConsequence : assessment.initialAssessment.consequence,
            controlledLikelihood : assessment.initialAssessment.likelihood
          });
          currentListCost.push(Number(assessment.initialAssessment.cost));
        }
      });
      var maxCurrentCost= _.max(currentListCost);
      var maxCurrentRating = _.max(currentList, function(obj) {
        return obj.controlledRating;
      });
      overallAssessment.controlledRating = maxCurrentRating.controlledRating;
      overallAssessment.controlledConsequence = maxCurrentRating.controlledConsequence;
      overallAssessment.controlledLikelihood = maxCurrentRating.controlledLikelihood;
      overallAssessment.controlledCost = maxCurrentCost;

      $scope.overall = overallAssessment;
    }

    $scope.addControl = function(index, ctrl) {
      var contr = angular.copy(ctrl);
      if ($scope.selectedCtrls[index]) {
        $scope.selectedCtrls[index].push(contr);
      } else {
        $scope.selectedCtrls[index] = [contr];
      }
      $scope.record.assessment[index].controls.push({
        control: contr._id,
        effectiveness: 'Improvement required'
      });
      doCalc();
    };

    $scope.$watch('record.assessment', function(ov, nv) {
      if (ov !== nv) {
        doCalc();
      }
    }, true);
  })

  .controller('ShowLegendDialogCtrl', function($scope, $uibModalInstance, EnumItems, data) {
    $scope.cancel = function() {
      $uibModalInstance.dismiss();
    };
    var key = data.key || '';
    $scope.code = data.code || '';
    var enums = EnumItems.getAllItems();

    $scope.items = enums[key];
  })

  .controller('MoveControlDialogCtrl', function($scope, $uibModalInstance, EnumItems, data) {
    $scope.control = data.control;
    $scope.risks = data.risks;
    $scope.selected = {};
    $scope.selected.index = data.riskIndex;
    $scope.selected.risk = $scope.risks[$scope.selected.index];
    $scope.cancel = function() {
      $uibModalInstance.dismiss();
    };
    $scope.move = function() {
      $uibModalInstance.close($scope.selected.index, $scope.selected.risk);
    };
  })

  .controller('ShowRiskMatrixDialogCtrl', function($scope, $uibModalInstance, $timeout, Enum, MatrixService, data, EnumItems) {
    $scope.matrixItems = [];
    var category = data.category || '';
    $scope.rating = data.rating;

    $scope.cancel = function() {
      $uibModalInstance.close();
    };

    $scope.isLoading = true;
    var enums = EnumItems.getAllItems();
    /*jshint camelcase: false */
    var categoryId = _.find(enums.risk_category, function(item) {
      return item.code === category;
    });

    MatrixService.listAll({}, function(result) {
      $scope.isLoading = false;
      if (!result || !result.length) {
        return;
      }
      angular.forEach(result, function(item) {
        if (item.itemId === categoryId.id) {
          $scope.matrixItems.push(item);
        }
      });
    });
  })

  .controller('gRecordListCtrl', function($scope, $rootScope, $state, DTOptionsBuilder, DTColumnDefBuilder, $resource, $filter, GovernanceRecord, authService, UserDetails, RestService, OrgUnits, Search , $location, FileSaveService) {
    $scope.isLoading = true;
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
        $scope.isLoading = true;
        $scope.data = {};
        $scope.data.query = '';
        $scope.data.currentPage = $location.hash() || 1;
        $scope.itemsPerPage = 10;
        $scope.noOfRows = 10;
        if ($rootScope.listFilters.record) {
          $scope.orgUnit = $rootScope.listFilters.record.orgUnit;
          $scope.includeChildren = $rootScope.listFilters.record.includeChildren;
        }
        $scope.getResults(true);
      }
    }, true);

    $scope.getResults = function (bResetFacet) {
        $location.hash($scope.data.currentPage);
        var unit = {
          $modelValue : $scope.orgUnit
        };
        $scope.updateSearchResults(unit, bResetFacet);
    };



    $scope.exportAsCSV = function () {
      var url= '/api/governance-records/filter/'+$scope.orgUnit.orgUnitId+'?csv=true&?children='+$scope.includeChildren, children;
      if ($scope.includeChildren) {
        children = OrgUnits.getChidlren($scope.orgUnit);
      }
      FileSaveService.exportAsCSV(url, 'governance-records', 'POST', {children : children});
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
          },
          'reviewType' :{
             'terms': {
              'field': 'REVIEW_TYPE',
              'size': 10
            }           
          },
          'controlledRating': {
            'terms': {
              'field': 'OVERALL_CONTROLLED_RATING',
              'size': 10
            }
          }
        };
      }
      var data = {
        query: $scope.data.query,
        params : {
          type : 'GOVERNANCE_RECORD',
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
      .withPaginationType('simple')
      .withBootstrap();
    $scope.dtColumnDefs = [
      DTColumnDefBuilder.newColumnDef(0).withOption('className', 'id-column').withOption('sType', 'entityid'),
      DTColumnDefBuilder.newColumnDef(1).withOption('defaultContent', '').withOption('className', 'title-column'),
      DTColumnDefBuilder.newColumnDef(2).withOption('defaultContent', '').withOption('className', 'category-column'),
      DTColumnDefBuilder.newColumnDef(3).withOption('defaultContent', '').withOption('className', 'unit-column'),
      DTColumnDefBuilder.newColumnDef(4).withOption('defaultContent', '').withOption('className', 'status-column'),
      DTColumnDefBuilder.newColumnDef(5).withOption('defaultContent', '').withOption('className', 'review-type-column'),
      DTColumnDefBuilder.newColumnDef(6).withOption('defaultContent', '').withOption('className', 'rating-column'),
      DTColumnDefBuilder.newColumnDef(7).withOption('defaultContent', '').withOption('className', 'rating-column'),
      DTColumnDefBuilder.newColumnDef(8).withOption('defaultContent', '').withOption('className', 'rating-column'),
      DTColumnDefBuilder.newColumnDef(9).renderWith(function(data, type) {
        if (type === 'sort' || type === 'type') {
          return data;
        }
        if (type === 'display' || type === 'filter') {
          return  $filter('date')(data, 'dd-MMM-yyyy');
        }
      }).withOption('sType', Date.parse()).withOption('className', 'date-column')

    ];

    $scope.goToRecord = function(recId) {
      $state.go('governance-record.view', {recordId: recId});
    };
  });