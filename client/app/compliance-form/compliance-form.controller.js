'use strict';

angular.module('grcApp')
  .controller('ComplianceFormCtrl', function () {
    
  })
  .controller('ComplianceFormListCtrl', function ($scope, $rootScope, authService, $state, DTOptionsBuilder, DTColumnDefBuilder, $location, Search, OrgUnits, $http) {
    $scope.currentUser = authService.getCurrentUser();
    $scope.isLoading = true;
    $scope.includeChildren = false;
    $scope.orgUnit = {};
    $scope.itemsPerPage = 10;
    $scope.noOfRows = 10;
    $scope.result = {
      forms : {
        data : [],
        filters : {},
        facets : [],
        pagination : {
          currentPage : $location.hash() || 1
        },
      },
      responses : {
        data : [],
        filters : {},
        facets : [],
        pagination : {
          currentPage : $location.hash() || 1
        }
      },
      pending : {
        data : []
      }
    };
    $scope.$watch(function() {
      return $rootScope.orgTree;
    }, function() {
      if ($rootScope.orgTree) {
        $rootScope.listFilters = $rootScope.listFilters || {};
        $scope.orgUnit = $rootScope.orgTree[0];
        $scope.orgTree = $rootScope.orgTree;
        $scope.isLoading = true;
        if ($rootScope.listFilters.directorsQues) {
          $scope.orgUnit = $rootScope.listFilters.directorsQues.orgUnit;
          $scope.includeChildren = $rootScope.listFilters.directorsQues.includeChildren;
        }
        $scope.getResults(true);
      }
    }, true);

    $scope.getResults = function (bResetFacet) {
        $location.hash($scope.result.forms.pagination.currentPage);
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

    $scope.goToComplianceForm = function (complianceForm) {
      $state.go('compliance-form.view', {id: complianceForm.id});
    };
    $scope.fillResponse = function (complianceFormId, responseId) {
      $state.go('compliance-form.response', {complianceFormId: complianceFormId, responseId : responseId});
    };
    $scope.refreshItemsPerPage = function(items, bResetFacet){
      if (items === 'all') {
        $scope.itemsPerPage = $scope.result.hits.found;
      }else{
        $scope.itemsPerPage = Number(items);
      }
      if ($scope.itemsPerPage <= $scope.result.hits.found) {
        $scope.result.forms.pagination.currentPage = 1;
        $scope.result.responses.pagination.currentPage = 1;
        $scope.getResults(bResetFacet);
      }
    };

    function getPendingSurveys () {
      $http.get('/api/compliance-forms/pending-surveys')
      .then(function (surveys) {
        $scope.result.pending.data = surveys.data;
      })
      .catch(function () {
      });
    }

    getPendingSurveys();
    $scope.updateSearchResults = function(scope, bResetFacet) {
      scope = scope || {};
      $scope.isLoading = true;
      var aggregations = false;
      var orgUnit = scope.$modelValue;
      if (orgUnit) {
        $scope.orgUnit = orgUnit;
        $('#heirarchy').modal('hide');
      }
      $scope.result.forms.filters.orgUnitId = $scope.orgUnit.orgUnitId ;
      $scope.result.responses.filters.orgUnitId = $scope.orgUnit.orgUnitId ;
      $scope.result.responses.filters.includeChildren = $scope.includeChildren;
      $scope.result.forms.filters.includeChildren = $scope.includeChildren;

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
      var formsQuery = {
        query: '',
        params : {
          type : 'compliance-form',
          size : $scope.itemsPerPage,
          start: (($scope.result.forms.pagination.currentPage - 1) * $scope.itemsPerPage)
        },
        body : {
          aggregations : aggregations,
          filters :  $scope.result.forms.filters
        }
      };
      var resQuery = {
        query: '',
        params : {
          type : 'compliance-form-response',
          size : $scope.itemsPerPage,
          start: (($scope.result.responses.pagination.currentPage - 1) * $scope.itemsPerPage)
        },
        body : {
          aggregations : aggregations,
          filters :  $scope.result.responses.filters
        }
      };      
      $rootScope.listFilters.directorsQues = {
        orgUnit : $scope.orgUnit,
        includeChildren : $scope.includeChildren
      };
      Search.get(formsQuery)
      .then(function (res) {
        var result = res.data;
        $scope.result.forms.data = result;
        if (aggregations) {
          $scope.result.forms.facets = result.aggregations;
        }
        $scope.isLoading = false;
      }).catch(function () {
        $scope.isLoading = false;
      });

      Search.get(resQuery)
      .then(function (res) {
        var result = res.data;
        $scope.result.responses.data = result;
        if (aggregations) {
          $scope.result.responses.facets = result.aggregations;
        }
        $scope.isLoading = false;
      }).catch(function () {
        $scope.isLoading = false;
      });
    };
  })
  .controller('ComplianceFormEditCtrl', function ($scope, $builder, authService, EnumItems, Users, Search, ComplianceForm, spinner, $state, $stateParams) {
    $scope.currentUser = authService.getCurrentUser();
    $scope.formData = {};
    $scope.enums = EnumItems.getAllItems();
    $scope.users = Users.getAllUsers();
    var formId = $stateParams.id;
    if (formId) {
      ComplianceForm.get({id : formId}, function(form) {
        $scope.formObject = JSON.parse(form.complianceFormTemplateId.formJSON);
        $builder.forms['default'] = JSON.parse(form.complianceFormTemplateId.formJSON);
        $scope.formData = form;
        $scope.showFormBuilder = true;
      });
    }else{
      $scope.showFormBuilder = true;
    }

    var getTemplates = function() {
      var filters = {
        status : 'Released'
      };
      if ($scope.currentUser.role !== 'admin') {
        filters.responsibleUsers = $scope.currentUser._id;
      }
      var data = {
        query: '',
        params : {
          type : 'compliance-form-template',
          size : 10000,
          start: 0
        },
        body : {
          aggregations : false,
          filters : filters
        }
      };

      Search.get(data)
      .then(function (res) {
        $scope.complianceFormTemplates = res.data.hits.hits;
      }).catch(function () {
        //TODO 
      });
    };

    $scope.previewForm = function (complianceFormTemplate) {
      $scope.formData.complianceFormTemplateId = complianceFormTemplate._id;
      $scope.formData.category = complianceFormTemplate._source.category;
      $scope.formObject = JSON.parse(complianceFormTemplate._source.formJSON);
      $builder.forms['default'] = angular.copy($scope.formObject)
    };

    $scope.updateSearchResults = function (scope) {
      scope = scope || {};
      var orgUnit = scope.$modelValue;
      if (orgUnit) {
        $scope.formData.responsibleOrg = orgUnit;
        $('#heirarchy').modal('hide');
      }
    };
    
    $scope.save = function (isValid) {
      if (!isValid) {
        $scope.submitted = true;
      }
      $scope.submitted = false;
      spinner.startSpinner();
      $scope.formData.formJSON = JSON.stringify($scope.formObject);
      if ($scope.formData._id) {
        if ($scope.formData.status === 'Archived') {
          $scope.formData.status = 'Draft';
        }
        $scope.formData.$update(function(form) {
          spinner.stopSpinner();
          $state.go('compliance-form.view', {id : form._id});
        },function () {
          spinner.stopSpinner();
        });
      }else{
        var form = new ComplianceForm($scope.formData);
        form.$save(function(form) {
          spinner.stopSpinner();
          $state.go('compliance-form.view', {id : form._id});
        },function () {
          spinner.stopSpinner();
        });
      }
    };
    getTemplates();
  })
  .controller('ComplianceFormViewCtrl', function ($scope, ComplianceForm, $stateParams, $builder, spinner) {
      var formId = $stateParams.id;
      ComplianceForm.get({id : formId}, function(form) {
        $builder.forms['default'] = JSON.parse(form.complianceFormTemplateId.formJSON);
        $scope.formObject = JSON.parse(form.complianceFormTemplateId.formJSON);
        $scope.complianceForm = form;
      });

      $scope.changeStatus = function (status) {
        spinner.startSpinner();
        $scope.complianceForm.status = status;
        $scope.complianceForm.$update(function(form) {
          spinner.stopSpinner();
          $state.go('compliance-form.view', {id : form._id});
        },function () {
          spinner.stopSpinner();
        });
      };
  })
  .controller('ComplianceFormResponseCtrl', function ($scope, $stateParams, $http, ComplianceForm, $builder, spinner, $state, ComplianceFormResponse) {
    $scope.template = {};
    var responseId = $stateParams.responseId;
    var complianceFormId = $stateParams.complianceFormId;

    if (responseId) {
      ComplianceFormResponse.get({id : responseId}, function(response) {
        $scope.formObject = JSON.parse(response.formJSON);
        $builder.forms['default'] = JSON.parse(response.formJSON);
        $scope.formData = response;
        $scope.showFormBuilder = true;
      });
    }else{
      ComplianceForm.get({id : complianceFormId}, function(response) {
        $scope.formData = {};
        $builder.forms['default'] = JSON.parse(response.complianceFormTemplateId.formJSON);
        $scope.formData.status = 'Draft';
        $scope.formObject = JSON.parse(response.complianceFormTemplateId.formJSON);
        $scope.formData.complianceForm = response._id;
        $scope.formData.responsibleOrg = response.responsibleOrg;
        $scope.formData.includeChildOrgs = response.includeChildOrgs;
        $scope.formData.description = response.complianceFormTemplateId.description;
        $scope.formData.title = response.title;
        $scope.showFormBuilder = true;
      });
    }

    
    $scope.save = function (isValid) {
      if (!isValid) {
        $scope.submitted = true;
      }
      var formTemplate = $builder.forms['default'];
      for (var i = 0; i < formTemplate.length; i++) {
        $scope.formObject[i] = _.merge($scope.formObject[i], formTemplate[i]);
      };

      $scope.formData.formJSON = JSON.stringify($scope.formObject);
      $scope.submitted = false;
      spinner.startSpinner();
      var promise;
      if ($scope.formData._id) {
        promise = $http.put('/api/compliance-form-responses/'+$scope.formData._id, $scope.formData)
      }else{
        promise = $http.post('/api/compliance-form-responses', $scope.formData)
      }
      promise.then(function (survey) {
        $state.go('compliance-form.response', {complianceFormId: $scope.formData.complianceForm, responseId : survey.data._id});
      })
      .catch(function (error) {
      });
    };    
  });

