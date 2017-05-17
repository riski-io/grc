'use strict';
/* global angular */
angular.module('grcApp').controller('governanceDashboardCtrl', function($scope,
      $timeout, $rootScope, Search) {
      var maxDate = new Date();
      var minDate = new Date().setFullYear(maxDate.getFullYear() - 2);
      var maxDateMs = maxDate.getTime();
      var filters = [{
        'range': {
          'updatedAt': {
            'gte': minDate,
            'lte': maxDateMs + 1,
          }
        }
      }];

      function pieChartOptions () {
      	return {
      		chart: {
                type: 'pieChart',
                height: 400,
                x: function(d){return d.key;},
                y: function(d){return d.y;},
                showLabels: true,
                duration: 500,
                labelType : 'percent',
                labelThreshold: 0.01,
                labelSunbeamLayout: true,
                legend: {
                    margin: {
                        top: 5,
                        right: 0,
                        bottom: 5,
                        left: 0
                    }
                }
            }
      	}
      }
      function stackBarChartOptions(type) {
        return {
          chart: {
            type: 'multiBarChart',
            margin: {
              top: 40,
              right: 80,
              bottom: 80,
              left: 45
            },
            duration: 700,
            rotateLabels: 8,
            clipEdge: false,
            //staggerLabels: true,
            stacked: true,
            xAxis: {
              axisLabel: '',
              showMaxMin: false,
              tickFormat: function(d) {
                return d;
              }
            },
            yAxis: {
              axisLabel: 'Risk ' + type + ' by category',
              showMaxMin: false,
              tickFormat: function(d) {
                return d3.format(',.f')(d);
              }
            }
          }
        }
      }

      function getRiskCostByCategory(widget) {
        var orgFilter;
        if ($scope.orgUnit) {
          orgFilter = ({
            term: {
              'parentOrgs.id': $scope.orgUnit.orgUnitId
            }
          });
        }
        var filterJSON = {};
/*        if (!_.isEmpty(widget.filter)) {
          if (!_.isArray(widget.filter)) {
            var widget.filter
          }
          filterJSON.terms = {
            status: widget.filter
          };
        };*/
        var aggr = {};
        aggr.orgUnit = {
          'filter': filterJSON,
          'aggs': {
            'orgUnit': {
              'terms': {
                'field': 'orgUnitName',
                'size': 15,
                'order': {
                  'cost': 'desc'
                }
              },
              'aggs': {
                'cost': {
                  'sum': {
                    'field': 'overallAssessment.controlledCost'
                  }
                },
                'category': {
                  'terms': {
                    'field': 'category',
                    'size': 10,
                    'order': {
                      'cost': 'desc'
                    }
                  },
                  'aggs': {
                    'cost': {
                      'sum': {
                        'field': 'overallAssessment.controlledCost'
                      }
                    }
                  }
                }
              }
            }
          }
        };
		    aggr.status = {
            'terms': {
              'field': 'status',
              'size': 10
            }
          };
          var params = {
            type: 'governancerecord'
          };
          var data = {
            filters: filters,
            orgFilter: orgFilter,
            aggregations: aggr
          };
          Search.getAggregations(data, params).then(function(results) {
            var aggregations = results.data.aggregations;
            var data = {};
            var orgUnits = [];
            _.forEach(aggregations.orgUnit.orgUnit.buckets, function(
              orgUnit) {
              _.forEach(orgUnit.category.buckets, function(category) {
                data[category.key] = data[category.key] || [];
                if (category.cost.value >= 0) {
                  if (orgUnits.indexOf(orgUnit.key) == -1) {
                    orgUnits.push(orgUnit.key);
                  }
                  data[category.key].push({
                    x: orgUnit.key,
                    y: Math.ceil(category.cost.value)
                  });
                };
              });
            });
            var list = []
            _.forOwn(data, function(aggr, key) {
              var values = [];
              _.forEach(orgUnits, function(unit) {
                var obj = _.find(aggr, {x: unit});
                if (obj) {
                  values.push(obj);
                }else{
                  values.push({
                    x: unit,
                    y : 0
                  });
                }
              });
              list.push({
                key: key,
                values: values
              })
            });
            widget.chart.data = list;
            widget.chart.api.update();
          });
        };
        function getRiskCountByCategory(widget) {
          var orgFilter;
          if ($scope.orgUnit) {
            orgFilter = ({
              term: {
                'parentOrgs.id': $scope.orgUnit.orgUnitId
              }
            });
          }
          var filterJSON = {};
          if (!_.isEmpty(widget.filter)) {
            filterJSON.terms = {
              status: filter
            };
          };
          var aggr = {};
          aggr.orgUnit = {
            'filter': filterJSON,
            'aggs': {
              "orgUnit": {
                "terms": {
                  "field": "orgUnitName",
                  "size": 15,
                  "order": {
                    "_count": "desc"
                  }
                },
                "aggs": {
                  "category": {
                    "terms": {
                      "field": "category",
                      "size": 10,
                      "order": {
                        "_count": "desc"
                      }
                    }
                  }
                }
              }
            }
          };
          aggr.status = {
            'terms': {
              'field': 'status',
              'size': 10
            }
          };
          var params = {
            type: 'governancerecord'
          };
          var data = {
            filters: filters,
            orgFilter: orgFilter,
            aggregations: aggr
          };
          Search.getAggregations(data, params).then(function(results) {
            var aggregations = results.data.aggregations;
            var data = {};
            var orgUnits = [];
            _.forEach(aggregations.orgUnit.orgUnit.buckets, function(
              orgUnit) {
              _.forEach(orgUnit.category.buckets, function(category) {
                data[category.key] = data[category.key] || [];
                if (category.doc_count >= 0) {
                  if (orgUnits.indexOf(orgUnit.key) == -1) {
                    orgUnits.push(orgUnit.key);
                  }
                  data[category.key].push({
                    x: orgUnit.key,
                    y: Math.ceil(category.doc_count)
                  });
                };
              });
            });
            var list = []
            _.forOwn(data, function(aggr, key) {
              var values = [];
              _.forEach(orgUnits, function(unit) {
                var obj = _.find(aggr, {x: unit});
                if (obj) {
                  values.push(obj);
                }else{
                  values.push({
                    x: unit,
                    y : 0
                  });
                }
              });
              list.push({
                key: key,
                values: values
              });
            });
            widget.chart.data = list;
            widget.chart.api.update();
          });
        };

        function getRiskCountByCategoryforPie(widget) {
          var orgFilter;
          if ($scope.orgUnit) {
            orgFilter = ({
              term: {
                'parentOrgs.id': $scope.orgUnit.orgUnitId
              }
            });
          }
          var filterJSON = {};
          if (!_.isEmpty(widget.filter)) {
            filterJSON.terms = {
              status: filter
            };
          };
          var aggr = {};
          aggr.category = {
            'filter': filterJSON,
            'aggs': {
		        'category': {
		            'terms': {
		              'field': 'category',
		              'size': 10,
		              'order': {
		                '_count': 'desc'
		              }
		            }
		        }
            }
          };
          aggr.status = {
            'terms': {
              'field': 'status',
              'size': 10
            }
          };
          var params = {
            type: 'governancerecord'
          };
          var data = {
            filters: filters,
            orgFilter: orgFilter,
            aggregations: aggr
          };
          Search.getAggregations(data, params).then(function(results) {
            var aggregations = results.data.aggregations;
            var data = [];
            _.forEach(aggregations.category.category.buckets, function(
              category) {
              	data.push({
              		key : category.key,
              		y : category.doc_count
              	});
            });
            widget.chart.data = data;
            widget.chart.api.update();
          });
        }

        function getRiskValueByCategoryforPie(widget) {
          var orgFilter;
          if ($scope.orgUnit) {
            orgFilter = ({
              term: {
                'parentOrgs.id': $scope.orgUnit.orgUnitId
              }
            });
          }
          var filterJSON = {};
          if (!_.isEmpty(widget.filter)) {
            filterJSON.terms = {
              status: filter
            };
          };
          var aggr = {};
          aggr.category = {
            'filter': filterJSON,
            'aggs': {
		        'category': {
		            'terms': {
		              'field': 'category',
		              'size': 10,
		              'order': {
		                '_count': 'desc'
		              }
		            },
		            'aggs': {
				        'cost': {
				          'sum': {
				            'field': 'overallAssessment.controlledCost'
				          }
				        }
				      }
		        }
            }
          };
          aggr.status = {
            'terms': {
              'field': 'status',
              'size': 10
            }
          };
          var params = {
            type: 'governancerecord'
          };
          var data = {
            filters: filters,
            orgFilter: orgFilter,
            aggregations: aggr
          };
          Search.getAggregations(data, params).then(function(results) {
            var aggregations = results.data.aggregations;
            var data = [];
            _.forEach(aggregations.category.category.buckets, function(
              category) {
              	data.push({
              		key : category.key,
              		y : category.cost.value
              	});
            });
            widget.chart.data = data;
            widget.chart.api.update();
          });
        }
        $scope.$watch(function() {
          return $rootScope.orgTree;
        }, function() {
          $scope.orgUnit = $rootScope.defaultOrgUnit;
          if ($rootScope.orgTree) {
            $timeout(function() {
              $scope.dashboard = {
                widgets: [{
                  col: 0,
                  row: 0,
                  sizeY: 2,
                  sizeX: 2,
                  filters: {},
                  name: "Category Analysis : Risk count by category",
                  chart: {
                    options: pieChartOptions(),
                    data: [],
                    api: {}
                  }
                },{
                  col: 2,
                  row: 0,
                  sizeY: 2,
                  sizeX: 2,
                  filters: {},
                  name: "Category Analysis : Risk value by category",
                  chart: {
                    options: pieChartOptions(),
                    data: [],
                    api: {}
                  }
                },{
                  col: 0,
                  row: 2,
                  sizeY: 2,
                  sizeX: 4,
                  filters: {},
                  name: "OrgUnit Analysis : Risk count by category",
                  chart: {
                    options: stackBarChartOptions("count"),
                    data: [],
                    api: {}
                  }
                }, {
                  col: 0,
                  row: 3,
                  sizeY: 2,
                  sizeX: 4,
                  filters: {},
                  name: "OrgUnit Analysis : Risk cost by category",
                  chart: {
                    options: stackBarChartOptions("cost"),
                    data: [],
                    api: {}
                  }
                }]
              };
              getRiskCountByCategoryforPie($scope.dashboard.widgets[0]);
              getRiskValueByCategoryforPie($scope.dashboard.widgets[1]);
              getRiskCountByCategory($scope.dashboard.widgets[2]);
              getRiskCostByCategory($scope.dashboard.widgets[3]);
            }, 0);
          }
        }, true);
        // We want to manually handle `window.resize` event in each directive.
        // So that we emulate `resize` event using $broadcast method and internally subscribe to this event in each directive
        // Define event handler
        $scope.events = {
          resize: function(e, scope) {
            $timeout(function() {
              scope.api.update()
            }, 200)
          }
        };
        angular.element(window).on('resize', function(e) {
          $scope.$broadcast('resize');
        });
        // We want to hide the charts until the grid will be created and all widths and heights will be defined.
        // So that use `visible` property in config attribute
        $scope.config = {
          visible: false
        };
        $timeout(function() {
          $scope.config.visible = true;
        }, 200);
      });