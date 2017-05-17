'use strict';

angular.module('grcApp').controller('SearchCtrl', function($scope, $filter, $location, Search, RestService, $state, $stateParams, OrgUnits, spinner) {
  var query;
  $scope.query = $stateParams.query;
  $scope.currentPage = $location.hash() || 1;
  $scope.itemsPerPage = 10;
  $scope.filters = {
    _type : [],
    category : [],
    status : []
  };
  function updateSearchResults() {
    $scope.isLoadingFilters = true;
    var aggregations = false;
    if (query !== $scope.query) {
      query = $scope.query;
      aggregations = {
        'status': {
            'terms': {
              'field': 'status',
              'size': 10
            }
          },
          'category': {
            'terms': {
              'field': 'category',
              'size': 10
            }
          },
          'type': {
            'terms': {
              'field': '_type', 
              'size': 10
            }
          }
      };
    }
    var data = {
      query: $scope.query,
      params : {
        highlight : true,
        start: (($scope.currentPage - 1) * $scope.itemsPerPage)
      },
      body : {
        filters : $scope.filters,
        aggregations : aggregations
      }
    };
    Search.get(data)
    .then(function (res) {
      var result = res.data;
      $scope.result = result;
      if (aggregations) {
        $scope.facets = result.aggregations;
      }
      $scope.isLoadingFilters = false;
      spinner.stopSpinner();
    }).catch(function () {
      $scope.isLoadingFilters = false;
      spinner.stopSpinner();
    });
  }  
  updateSearchResults();

  $scope.search = function(forceUpdate, page) {
    if (forceUpdate) {
      $state.go('search.query', {query: $scope.query});
    } else if (parseInt(page) !== parseInt($location.hash())) {
      $scope.currentPage = page;
      $location.hash(page);
      updateSearchResults();
    }
  };

  $scope.typeMap = {
    governancerecord: {
      title: 'Records',
      url: '/governance-record/'
    },
    complianceformtemplate:{
      title : 'Compliance Form Template',
      url : '/compliance-form-template/'
    },
    review: {
      title: 'Reviews',
      url: '/review/'
    },
    control: {
      title: 'Controls',
      url: '/control/'
    },
    actionitem: {
      title: 'Action Items',
      url: '/action-item/'
    }
  };
  $scope.facets = {};

  $scope.updateSelectedFacets = function() {
    $location.hash(1);
    $scope.currentPage = 1;
    updateSearchResults();
  };


});

