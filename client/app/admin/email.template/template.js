'use strict';

angular.module('grcApp').config(function($stateProvider) {
  $stateProvider.state('admin.templates', {
    url: '/templates',
    templateUrl: 'app/admin/email.template/template.html',
    controller: 'TemplateCtrl',
    authenticate : true,
    access : 'admin'
  }).state('admin.templatesEdit', {
    url: '/templates/edit/:id',
    templateUrl: 'app/admin/email.template/template.edit.html',
    controller: 'TemplateEditCtrl',
    authenticate : true,
    access : 'admin'
  });
});
