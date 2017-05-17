'use strict';
/* global angular */

angular.module('grcApp')

.controller('reportsCtrl', function($scope, EnumItems) {
  $scope.enums = EnumItems.getAllItems();
})

.controller('governanceMatrixCtrl', function($scope, $filter, FileSaveService, $state, RestService, RisksService, $rootScope, OrgUnits, DTOptionsBuilder, Search) {
  $scope.svgId = 'riskMatrix';
  $scope.risks = [];
  $scope.records = [];
  $scope.rowNumber = 10;
  $scope.currentPage = 1;
  $scope.sortField = 'recordId';
  $scope.reverseSort = false;
  $scope.filtersChanged = false;
  $scope.initialised = false;
  $scope.filters = {
    category: '',
    reviewType: '',
    unit: '',
    assessment: 'initialAssessment'
  };

  function watchFilters() {
    $scope.$watchCollection('filters', function(nv, ov) {
      if (nv !== ov) {
        $scope.filtersChanged = true;
      }
    });
  }

  $scope.dtOptions = DTOptionsBuilder.newOptions()
    .withPaginationType('full_numbers')
    .withBootstrap();

  $scope.tableConfig = {
    header: 'Risk Matrix Report.',
    nameSuffix: 'Risk-Matrix-Report-',
    model: [{
        title: 'Id',
        key: 'id'
      }, {
        title: 'Title',
        key: 'title'
      },
      {
        title: 'Status',
        key: 'status'
      }, {
        title: 'Init.R',
        key: 'overallAssessment.initialRating'
      }, {
        title: 'Contr.R',
        key: 'overallAssessment.controlledRating'
      }, {
        title: 'Targ.R',
        key: 'overallAssessment.targetRating'
      }
    ]
  };


  function getRecords (scope) {
    scope = scope || {};
    $scope.initialised = false;
    var orgUnit = scope.$modelValue;
    if (orgUnit) {
      $scope.orgUnit = orgUnit;
      $('#heirarchy').modal('hide');
    }
    $scope.filters = $scope.filters || {};
    var data = {
      query: '',
      params : {
        type : 'governancerecord',
        size : 10000
      },
      body : {
        filters : {
          orgUnitId : $scope.orgUnit.orgUnitId,
          includeChildren : $scope.includeChildren
        }
      }
    };
    Search.get(data)
    .then(function (res) {
      var records = res.data.hits.hits || [];
      allRecords = records;
      allRisks = RisksService.getAll(allRecords);
      $scope.initialised = true;
      $scope.doFilter();
      watchFilters();
    }).catch(function (error) {
      // body...
    });
  }

  var allRisks = [],
    filteredRisks = [],
    allRecords = [];
  $scope.$watch(function() {
    return $rootScope.orgTree;
  }, function() {
    if ($rootScope.orgTree) {
      $scope.orgUnit = $rootScope.defaultOrgUnit;
      $scope.orgTree = $rootScope.orgTree;
      $scope.includeChildren = true;
      $scope.filters = $scope.filters || {};
      getRecords();
    }
  }, true);
  
  $scope.toggle = function(scope) {
    scope.toggle();
  };

  $scope.filter = getRecords;
  $scope.updateSearchResults = getRecords;

  $scope.goToRecord = function(recId) {
    $state.go('governance-record.view', {
      recordId: recId
    });
  };
  $scope.doFilter = function() {
    var compare = {
        initialAssessment: function(a, b) {
          return b.initialAssessment.rating - a.initialAssessment.rating;
        },
        controlledAssessment: function(a, b) {
          return b.controlledAssessment.rating - a.controlledAssessment.rating;
        },
        overallAssessment: function(a, b) {
          return b.overallAssessment.rating - a.overallAssessment.rating;
        }
      },
      tempAllRisk = angular.copy(allRisks),
      tempFilteredRisks = angular.copy(filteredRisks),
      overallAssessmentRisks,
      risks;

    if ($scope.filters.category) {
      risks = $filter('filter')(tempAllRisk, {
        category: $scope.filters.category
      });
      overallAssessmentRisks = $filter('filter')(tempFilteredRisks, {
        category: $scope.filters.category
      });
    } else {
      risks = tempAllRisk;
      overallAssessmentRisks = tempFilteredRisks;
    }

    if ($scope.filters.reviewType) {
      risks = $filter('filter')(risks, {
        reviewType: $scope.filters.reviewType
      });
      overallAssessmentRisks = $filter('filter')(overallAssessmentRisks, {
        reviewType: $scope.filters.reviewType
      });
    }

    if ($scope.filters.status) {
      risks = $filter('filter')(risks, {
        status: $scope.filters.status
      });
      overallAssessmentRisks = $filter('filter')(overallAssessmentRisks, {
        status: $scope.filters.status
      });
    }

    // risks.sort(compare[$scope.filters.assessment]);
    risks.sort(compare.initialAssessment);
    overallAssessmentRisks.sort(compare.overallAssessment);
    
    setTimeout(function() {
      $scope.$apply(function() {
        $scope.risks = angular.copy(risks);
        $scope.overallAssessmentRisks = angular.copy(overallAssessmentRisks);
      });
    }, 0);
    if ($scope.initialised) {
      $scope.filtersChanged = false;
    } else {
      $scope.initialised = true;
    }
  };


  $scope.exportAsCSV = function () {
    var url= '/api/governance-records/filter/'+$scope.orgUnit.orgUnitId+'?csv=true&?children='+$scope.includeChildren, children;
    if ($scope.includeChildren) {
      children = OrgUnits.getChidlren($scope.orgUnit);
    }
    FileSaveService.exportAsCSV(url, 'governance-records', 'POST', {children : children});
  };

})

.controller('governanceTrendsCtrl', function($scope) {
  $scope.foo = 'governanceTrendsCtrl';
})

.controller('taskStatusCtrl', function($scope) {
  $scope.foo = 'taskStatusCtrl';
});