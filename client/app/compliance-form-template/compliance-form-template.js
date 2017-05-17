'use strict';
angular.module('grcApp')
.config(function($stateProvider) {
  $stateProvider
  .state('compliance-form-template', {
    abstract: true,
    url: '/compliance-form-template',
    templateUrl: "components/common/views/content.html",
    controller: 'ComplianceFormTemplateCtrl',
    authenticate: true
  })
  .state('compliance-form-template.list', {
    url: '/list',
    templateUrl: 'app/compliance-form-template/compliance-form-template-list.html',
    controller: 'ComplianceFormTemplateListCtrl',
    authenticate: true
  })
  .state('compliance-form-template.new', {
    url: '/new',
    templateUrl: 'app/compliance-form-template/compliance-form-template-edit.html',
    controller: 'ComplianceFormTemplateEditCtrl',
    authenticate: true
  })
  .state('compliance-form-template.edit', {
    url: '/edit/:id',
    templateUrl: 'app/compliance-form-template/compliance-form-template-edit.html',
    controller: 'ComplianceFormTemplateEditCtrl',
    authenticate: true
  })
  .state('compliance-form-template.view', {
    url: '/view/:id',
    templateUrl: 'app/compliance-form-template/compliance-form-template-view.html',
    controller: 'ComplianceFormTemplateViewCtrl',
    authenticate: true
  });
});