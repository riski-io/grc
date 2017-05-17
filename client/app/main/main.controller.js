'use strict';
angular.module('grcApp').controller('MainCtrl', function($rootScope,
  $scope, UserDetails, RisksService, $state, $location, spinner, OrgUnits, $timeout, Search, $filter) {
  $scope.risks = [];
  var maxDate = new Date();
  var minDate = new Date().setFullYear(maxDate.getFullYear() - 1);
  var maxDateMs = maxDate.getTime();
  spinner.startSpinner();
  $scope.$watch(function() {
    return $rootScope.orgTree;
  }, function() {
    $scope.orgUnit = $rootScope.defaultOrgUnit;
    $scope.includeChildren = true;
    if ($rootScope.orgTree) {
     $timeout(function () {
        getTrendData();
        getHierarchyBrowser();
        getTopEntities();
     },0);
    }
  }, true);

  var filters = [{
    'range': {
      'updatedAt': {
        'gte': minDate,
        'lte': maxDateMs +  1,
      }
    }
  }];

  function getTrendData () {
    var orgFilter;
    if ($scope.orgUnit) {
      orgFilter = ({
        term : {
          'parentOrgs.id' : $scope.orgUnit.orgUnitId
        }
      });
    }
    var trendAggr = {
      'trends': {
        'date_histogram': {
          'field': 'updatedAt',
          'interval': '1M',
          'min_doc_count': 1,
          'extended_bounds': {
            'min': minDate,
            'max': maxDateMs
          }
        },
        'aggs': {
          'avgTrend': {
            'avg': {
              'field': 'overallAssessment.controlledRating'
            }
          },
          'maxTrend': {
            'max': {
              'field': 'overallAssessment.controlledRating'
            }
          }
        }
      }
    };
    var data = {
      filters : filters,
      orgFilter:orgFilter,
      aggregations : trendAggr
    };
    $scope.showChart = false;
    Search.getAggregations(data)
    .then(function (results) {
      $scope.columns = [
          {'id': 'avgTrend', 'type': 'line', 'name': 'Average Trend'},
          {'id': 'maxTrend', 'type': 'line', 'name': 'Max Trend'}
      ];
      $scope.xaxis = {'id': 'date'};
      var aggregations = results.data.aggregations;
      $scope.datapoints = [];
      if (aggregations && aggregations.trends && aggregations.trends.buckets) {
        var buckets = aggregations.trends.buckets;
        _.forEach(buckets, function (item) {
          $scope.datapoints.push({
            date : $filter('date')(new Date(item.key),'dd/MM/yyyy'),
            avgTrend : Math.round( item.avgTrend.value * 10 ) / 10,
            maxTrend : Math.round( item.maxTrend.value * 10 ) / 10
          });
        });
        $scope.showChart = true;
      }
    }).catch(function () {
      $scope.isLoadingFilters = false;
    }); 
  } 


  function getTopEntities () {
    var data = {
      query: '',
      params : {
        size : 5
      },
      body : {
        filters : {
          orgUnitId : $scope.orgUnit.orgUnitId,
          includeChildren : $scope.includeChildren
        }
      }
    };
    spinner.startSpinner();
    async.parallel([
      function(cb){
        data.params = {
          type : 'governancerecord',
          size : 10000
        };
        Search.get(data)
        .then(function (res) {
          var records = res.data.hits.hits || [];
          $scope.records = records.slice(0, 5);
          $scope.risks = RisksService.getAll(records);
          cb();
        }).catch(cb);
      },
      function(cb){
        data.params = {
          type : 'actionitem',
          size : 5
        };
        Search.get(data)
        .then(function (res) {
          $scope.actionItems = res.data.hits.hits;
          cb();
        }).catch(cb);
      },
      function(cb){
        data.params = {
          type : 'control',
          size : 5
        };
        Search.get(data)
        .then(function (res) {
          $scope.controls = res.data.hits.hits;
          cb();
        }).catch(cb);
      },
      function(cb){
        data.params = {
          type : 'review',
          size : 5
        };
        Search.get(data)
        .then(function (res) {
          $scope.reviews = res.data.hits.hits;
          cb();
        }).catch(cb);
      }
    ], function () {
       $timeout(function () {
        spinner.stopSpinner();
      }, 200);
    }); 
  }

  function getHierarchyBrowser () {
    var orgFilter;
    if ($scope.orgUnit) {
      orgFilter = ({
        term : {
          'parentOrgs.id' : $scope.orgUnit.orgUnitId
        }
      });
    }   
    var aggr = {
      'orgUnit': {
        'terms': {
          'field': 'orgUnitId',
          "size": 50,
        },
        'aggs': {
          'records': {
            'filter' : { 'term': { '_type': 'governancerecord' } },
            'aggs': {
              'status': {
                  'terms': {
                    'field': 'status',
                    'exclude' : ['Controlled', 'Suspended']
                  }
              },
              'category' : {
                'terms': {
                  'field': 'category'
                },
                'aggs': {
                  'ratings': {
                    'avg': {
                      'field': 'overallAssessment.controlledRating'
                    }
                  }
                }
              }
            }
          },
          'actionItems': {
            'filter' : { 'term': { '_type': 'actionitem' } },
            'aggs': {
              'status': {
                'terms': {
                  'field': 'status',
                  'exclude' : ['Resolved', 'Abandoned', 'Closed']
                }
              }
            }
          }
        }
      }
    };
    var data = {
      filters : filters,
      orgFilter : orgFilter,
      aggregations : aggr
    };
    $scope.showHierrachyBrowser = false;
    Search.getHierarchyBrowser(data)
    .then(function (results) {
      $scope.hierarchyBrowser = results.data;
      $scope.showHierrachyBrowser = true
    }).catch(function () {
      $scope.showHierrachyBrowser = true;
    }); 
  }

  $scope.updateSearchResults = function (scope) {
    scope = scope || {};
    var orgUnit = scope.$modelValue;
    if (orgUnit) {
      $scope.orgUnit = orgUnit;
      $('#heirarchy').modal('hide');
    }
    getTrendData();
    getHierarchyBrowser();
    getTopEntities();
  };

  $scope.goToRecord = function(recordId) {
    $state.go('governance-record.view', {
      recordId: recordId
    });
  };


});