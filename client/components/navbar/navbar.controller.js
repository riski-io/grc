'use strict';

angular.module('grcApp').controller('NavbarCtrl', function($scope, $sce, $stateParams, spinner, $rootScope, $location, $uibModal, $state, authService, HelpPages) {
  $scope.menu = [{
      'title': 'Home',
      'link': '/'
    }
  ];
  $scope.query = $stateParams.query;
  $scope.$watch(function() {
    return $stateParams.query;
  }, function(newVal) {
    $scope.query = newVal;
  });
  var helpPages = [];
  var modalInstance;
  $scope.isCollapsed = true;
  $scope.isAdmin = authService.isAdmin;
  $scope.getCurrentUser = authService.getCurrentUser;


  function loadHelpPages () {
    HelpPages.list({}, function(result) {
      if (result && result.length) {
        helpPages = _.keyBy(result, 'value');
      }
    });
  }

  $scope.showHelpPage = function () {
      var state = $rootScope.$state.$current.name;
      $scope.helpPage = null;
      spinner.startSpinner();
      HelpPages.query({pageType : state})
      .$promise.then(function(pages) {
        let page = {};
        if (pages && pages[0]) {
          page = pages[0];
        }
        $scope.helpPage = page;
        spinner.stopSpinner();
        modalInstance = $uibModal.open({
            templateUrl: 'app/help/help-view-modal.html',
            size : 'lg',
            scope:$scope,
            windowClass: 'animated fadeIn'
        });
    });
  };

  $scope.trustAsHtml = function(string) {
      return $sce.trustAsHtml(string);
  };

  $scope.cancel = function () {
    modalInstance.dismiss('cancel');
  };

  $scope.logout = function() {
    authService.logout();
    $location.path('/login');
  };

  $scope.isActive = function(route) {
    return route === $location.path();
  };
  $scope.search = function() {
    $state.go('search.query', {'query': $scope.query});
  };

  loadHelpPages();
});