'use strict';

angular.module('grcApp').config(function($stateProvider) {

  $stateProvider
  .state('search', {
      url: '/search',
      templateUrl: "components/common/views/content.html",
      authenticate: true
  })
  .state('search.query', {
    url: '/:query',
    templateUrl: 'app/search/search.html',
    controller: 'SearchCtrl',
    authenticate: true
  })
  .state('search.query.page', {
    url: '/:page',
    templateUrl: 'app/search/search.html',
    controller: 'SearchCtrl',
    authenticate: true
  });
});
