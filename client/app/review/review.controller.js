'use strict';
/* global angular */

angular.module('grcApp')

.controller('ReviewCtrl', function ($scope, $stateParams, $timeout, $state) {
    $scope.isLoading = false;

    $scope.goToRecord = function(recordId) {
        $state.go('governance-record.view', { recordId: recordId });
    };

    $scope.goToControl = function(controlId){
        $state.go('control.view', { controlId: controlId });
    };

})

.controller('ReviewViewCtrl', function ($scope, $stateParams, $timeout, $state, $sce, Review, notify, notifyTemplate, dialogs) {
    $scope.isLoading = true;
    if ( $stateParams.reviewId  && $stateParams.reviewId !== 'new' ) {
        $scope.review = Review.get({ id: $stateParams.reviewId }, function () {
            $scope.description = $sce.trustAsHtml($scope.review.description);
            $scope.isLoading = false;
        });
    }

    $scope.removeReview = function(entityId){
      var dialog = dialogs.create('app/confirm/confirm.html', 'CustomConfirmDialogCtrl', {}, {size: 'md', keyboard: true, backdrop: true});
      dialog.result.then(function(result) {
        if (result) {
          $scope.isLoading = true;
          Review.remove({ id: entityId}).$promise.then(function () {
            $state.go('review.list');
            notify({
              message:'Review ' + entityId + ' has been removed',
              classes: 'alert-info',
              templateUrl: notifyTemplate
            });
          });
        }
      });
    };

    $scope.editReview = function(reviewId){
        $state.go('review.edit', { reviewId: reviewId });
    };
})


.controller('ReviewEditCtrl', function ($scope, $stateParams, $state, $sce, Review, ReviewTemplate, RestService, EnumItems, Users, OrgUnits, notify, notifyTemplate, WysiwygConfig) {
    $scope.isLoading = true;
    $scope.review = {
      description : ''
    };
    $scope.orgUnits = OrgUnits.getAllUnits();
    $scope.enums = EnumItems.getAllItems();
    $scope.users = Users.getAllUsers();
    $scope.wysiwygConfig = WysiwygConfig;
    $scope.addedMember = {};

    $scope.statuses = ['Planned','In Progress','Closed','Cancelled'];
    if ( $state.is('review.edit') ) {
        $scope.review = Review.get({ id: $stateParams.reviewId }, function () {
            $scope.isLoading = false;
        });
    }

    if ( $state.is('review.new') ) {
        $scope.isLoading = false;
        angular.extend($scope.review, angular.copy(ReviewTemplate));
    }

    $scope.updateSearchResults = function (scope) {
      scope = scope || {};
      var orgUnit = scope.$modelValue;
      if (orgUnit) {
        $scope.review.responsibleOrg = orgUnit;
        $('#heirarchy').modal('hide');
      }
    };

    $scope.addParticipant = function(user){
        if (!user._id) {
            return ;
        }
        $scope.userIsPartisipant = false;

        angular.forEach($scope.review.participantList, function(value) {
            if (value._id === user._id){
                $scope.userIsPartisipant = true;
            }
        });
        if (!$scope.userIsPartisipant){
            $scope.review.participantList.push(user);
        }
        $scope.addedMember = {};
    };

    $scope.removeParticipant = function(member){
        var index = $scope.review.participantList.indexOf(member);
        if (index > - 1){
            $scope.review.participantList.splice(index, 1);
        }
    };

    $scope.saveReview = function(form){
        $scope.reviewSubmitted = true;
        if (form.$valid && $scope.review.participantList.length) {
            $scope.isLoading = true;
            window.scrollTo(0,0);
            if ($stateParams.reviewId && $stateParams.reviewId !== 'new') {
                Review.update({id: $stateParams.reviewId}, angular.copy($scope.review)).$promise.then(function () {
                    $state.go('review.view', {reviewId: $stateParams.reviewId});
                }, function (errResponse) {
                    $scope.isLoading = true;
                });
            } else {
                $scope.review.scheduleType = 'monthly';
                Review.save(angular.copy($scope.review)).$promise.then(function (result) {
                    $state.go('review.view', {reviewId: result._id});
                }, function (errResponse) {
                    $scope.isLoading = true;
                });
            }
        } else {
            if (form.$error.required){
                notify({
                    message:'Please fill all required fields',
                    classes: 'alert-danger',
                    templateUrl: notifyTemplate
                });
                window.scrollTo(0,0);
            }
        }
    };

})

.controller('ReviewListCtrl', function ($scope, $state, Review, RestService, OrgUnits, $rootScope, UserDetails, FileSaveService, DTOptionsBuilder, DTColumnDefBuilder, $filter, $location, Search) {
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
      $scope.data = {};
      $scope.data.query = '';
      $scope.data.currentPage = $location.hash() || 1;
      $scope.itemsPerPage = 10;
      $scope.noOfRows = 10;
      if ($rootScope.listFilters.review) {
        $scope.orgUnit = $rootScope.listFilters.review.orgUnit;
        $scope.includeChildren = $rootScope.listFilters.review.includeChildren;
      }
      $scope.getResults(true);
    }
  }, true);

  $scope.exportAsCSV = function () {
    var url= '/api/reviews/filter/'+$scope.orgUnit.orgUnitId+'?csv=true&?children='+$scope.includeChildren, children;
    if ($scope.includeChildren) {
      children = OrgUnits.getChidlren($scope.orgUnit);
    }
    FileSaveService.exportAsCSV(url, 'reviews', 'POST', {children : children});
  };

  $scope.refreshItemsPerPage = function(items){
    if (items === 'all') {
      $scope.itemsPerPage = $scope.result.hits.found;
    }else{
      $scope.itemsPerPage = Number(items);
    }
    if ($scope.itemsPerPage <= $scope.result.hits.found) {
      $scope.data.currentPage = 1;
      $scope.getResults();
    }
  };

  $scope.getResults = function (bResetFacet) {
    $location.hash($scope.data.currentPage);
    var unit = {
      $modelValue : $scope.orgUnit
    };
    $scope.updateSearchResults(unit, bResetFacet);
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
          'reviewType': {
            'terms': {
              'field': 'REVIEW_TYPE',
              'size': 10
            }
          }
        };
      }
      var data = {
        query: $scope.data.query,
        params : {
          type : 'review',
          size : $scope.itemsPerPage,
          start: (($scope.data.currentPage - 1) * $scope.itemsPerPage)
        },
        body : {
          filters : $scope.filters,
          aggregations : aggregations
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
    DTColumnDefBuilder.newColumnDef(0).withOption('defaultContent','').withOption('sType', 'entityid'), //ID
    DTColumnDefBuilder.newColumnDef(1).withOption('defaultContent',''), //Title
    DTColumnDefBuilder.newColumnDef(2).withOption('defaultContent',''), //Hosted By
    DTColumnDefBuilder.newColumnDef(3).withOption('defaultContent',''), //Scheduled By
    DTColumnDefBuilder.newColumnDef(4).withOption('defaultContent',''), //Type
    DTColumnDefBuilder.newColumnDef(5).withOption('defaultContent',''), //Status
    DTColumnDefBuilder.newColumnDef(6).renderWith(function(data, type) {
      if (type === 'sort' || type === 'type' ){
        return data;
      }
      if (type === 'display' || type === 'filter') {
        return  $filter('date')(data, 'dd-MMM-yyyy');
      }
    }).withOption('sType', Date.parse()).withOption('className','date-column')
  ];

  $scope.goToReview = function(reviewId) {
      $state.go('review.view', { reviewId: reviewId });
  };
});