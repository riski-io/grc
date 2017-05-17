'use strict';
angular.module('grcApp')
.config(function($stateProvider) {
  $stateProvider
  .state('compliance-form', {
    abstract: true,
    url: '/compliance-form',
    templateUrl: "components/common/views/content.html",
    controller: 'ComplianceFormCtrl',
    authenticate: true
  })
  .state('compliance-form.list', {
    url: '/list',
    templateUrl: 'app/compliance-form/compliance-form-list.html',
    controller: 'ComplianceFormListCtrl',
    authenticate: true
  })
  .state('compliance-form.new', {
    url: '/new',
    templateUrl: 'app/compliance-form/compliance-form-edit.html',
    controller: 'ComplianceFormEditCtrl',
    authenticate: true
  })
  .state('compliance-form.edit', {
    url: '/edit/:id',
    templateUrl: 'app/compliance-form/compliance-form-edit.html',
    controller: 'ComplianceFormEditCtrl',
    authenticate: true
  })
  .state('compliance-form.view', {
    url: '/view/:id',
    templateUrl: 'app/compliance-form/compliance-form-view.html',
    controller: 'ComplianceFormViewCtrl',
    authenticate: true
  }).state('compliance-form.response', {
    url: '/response?complianceFormId?responseId',
    templateUrl: 'app/compliance-form/compliance-form-response.html',
    controller: 'ComplianceFormResponseCtrl',
    authenticate: true
  });
});