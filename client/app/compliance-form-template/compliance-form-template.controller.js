'use strict';

angular.module('grcApp')
  .controller('ComplianceFormTemplateCtrl', function () {
    
  })
  .controller('ComplianceFormTemplateListCtrl', function ($scope, $rootScope, $state, DTOptionsBuilder, DTColumnDefBuilder, $location, Search, OrgUnits, ComplianceFormTemplate) {
    
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
        if ($rootScope.listFilters.directorsQues) {
          $scope.orgUnit = $rootScope.listFilters.directorsQues.orgUnit;
          $scope.includeChildren = $rootScope.listFilters.directorsQues.includeChildren;
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

    $scope.dtOptions = DTOptionsBuilder.newOptions()
      .withOption('bFilter', false)
      .withOption('bLengthChange', false)
      .withOption('iDisplayLength', 100000)
      .withPaginationType('simple')
      .withBootstrap();


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
          'category': {
            'terms': {
              'field': 'category',
              'size': 10
            }
          },
          'status': {
            'terms': {
              'field': 'status',
              'size': 10
            }
          }
        };
      }
      var data = {
        query: $scope.data.query,
        params : {
          type : 'compliance-form-template',
          size : $scope.itemsPerPage,
          start: (($scope.data.currentPage - 1) * $scope.itemsPerPage)
        },
        body : {
          aggregations : aggregations,
          filters : $scope.filters
        }
      };
      $rootScope.listFilters.directorsQues = {
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

    $scope.goToFormTemplate = function (id) {
      $state.go('compliance-form-template.view', {id: id});
    }
  })
  .controller('ComplianceFormTemplateEditCtrl', function ($scope, $stateParams, $builder, ComplianceFormTemplate, $state, EnumItems, Users, spinner) {
    $scope.enums = EnumItems.getAllItems();
    $scope.users = Users.getAllUsers();
    var templateId = $stateParams.id;

    if (templateId) {
      ComplianceFormTemplate.get({id : $stateParams.id}, function(template) {
        $builder.forms['default'] = JSON.parse(template.formJSON);
        $scope.template = template;
        $scope.showFormBuilder = true;
      });
    }else{
      $scope.showFormBuilder = true;
    }
    $scope.updateSearchResults = function (scope) {
      scope = scope || {};
      var orgUnit = scope.$modelValue;
      if (orgUnit) {
        $scope.template.responsibleOrg = orgUnit;
        $('#heirarchy').modal('hide');
      }
    };
    
    $scope.save = function (isValid) {
      if (!isValid) {
        $scope.submitted = true;
      }
      $scope.submitted = false;
      spinner.startSpinner();
      if ($scope.template._id) {
        if ($scope.template.status === 'Archived') {
          $scope.template.status = 'Draft';
        }
        $scope.template.formJSON = JSON.stringify($builder.forms['default']);
        $scope.template.$update(function(template) {
          spinner.stopSpinner();
          $state.go('compliance-form-template.view', {id : template._id});
        },function (error) {
          spinner.stopSpinner();
        });
      }else{
        var form = new ComplianceFormTemplate($scope.template);
        form.formJSON = JSON.stringify($builder.forms['default']);
        form.$save(function(template) {
          spinner.stopSpinner();
          $state.go('compliance-form-template.view', {id : template._id});
        },function (error) {
          console.log(error);
          spinner.stopSpinner();
        });
      }
    };
  })
  .controller('ComplianceFormTemplateViewCtrl', function ($scope, $stateParams, ComplianceFormTemplate, $builder, spinner, $state) {
    $scope.template = {};

    ComplianceFormTemplate.get({id : $stateParams.id}, function(template) {
      $builder.forms['default'] = JSON.parse(template.formJSON);
      $scope.formData = JSON.parse(template.formJSON);
      $scope.showFormBuilder = true;
      $scope.template = template;
    });

    $scope.changeStatus = function (status) {
      spinner.startSpinner();
      $scope.template.status = status;
      $scope.template.$update(function(template) {
        spinner.stopSpinner();
        $state.go('compliance-form-template.view', {id : template._id});
      },function (error) {
        spinner.stopSpinner();
        console.log(error);
      });
    };
  });
