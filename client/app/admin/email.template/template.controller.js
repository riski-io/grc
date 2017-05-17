'use strict';

angular.module('grcApp').controller('TemplateCtrl', function(dialogs, $timeout, Template, $scope, spinner) {
  spinner.startSpinner();
  Template.listAll({}, function(result) {
    if (result && result.length) {
      $scope.templates = _.sortBy(result, 'trigger');
    }
    spinner.stopSpinner();
  });

  $scope.removeItem = function(template) {
    var dialog = dialogs.create('app/confirm/confirm.html', 'CustomConfirmDialogCtrl', {}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      if (result) {
        Template.remove({id: template._id}, function() {
          template.remove();
        });
      }
    });
  };
});

angular.module('grcApp').controller('TemplateEditCtrl', function($scope, $state, $stateParams, Template, $timeout, spinner) {
  var id = $stateParams.id;
  $scope.template = {};
  spinner.startSpinner();
  $scope.isEdit = id && id.length;
  if ($scope.isEdit) {
    Template.get({id: id}, function(result) {
      if (!result || !result.key) {
        return $state.go('admin.templates');
      }
      $scope.template = result;
      $scope.variables = $scope.template.variables || [];
      delete $scope.template.variables;
      spinner.stopSpinner();
    });
  } else {
    spinner.stopSpinner();
  }

  $scope.options = {
    height: 200,
    focus: true,
    onCreateLink: function(sLinkUrl) {
      if (sLinkUrl.indexOf('@') !== -1 && sLinkUrl.indexOf(':') === -1) {
        sLinkUrl = 'mailto:' + sLinkUrl;
      } else if (sLinkUrl.indexOf('://') === -1 && sLinkUrl.indexOf('{{') !== 0) {
        sLinkUrl = 'http://' + sLinkUrl;
      }
      return sLinkUrl;
    }
  };

  var subjectTimeout;
  $scope.changeSubject = function() {
    $timeout.cancel(subjectTimeout);
    subjectTimeout = $timeout(function() {
      try {
        Handlebars.compile($scope.template.subject)($scope.variableData);
        $scope.compileSubjectError = null;
      } catch (e) {
        $scope.compileSubjectError = e.message;
      }
    }, 300);
  };
  var timeout;
  $scope.change = function() {
    $timeout.cancel(timeout);
    timeout = $timeout(function() {
      try {
        Handlebars.compile($scope.template.body)($scope.variableData);
        $scope.compileTemplateError = null;
      } catch (e) {
        $scope.compileTemplateError = e.message;
      }
    }, 300);
  };

  function createVariableTag(text) {
    return '{{' + text + '}}';
  }
  
  $scope.addVariable = function(variable) {
    if (variable && variable.length) {
      $timeout(function() {
        var editor;
        if ($.summernote.eventHandler.getEditor) {
          editor = $.summernote.eventHandler.getEditor();
        }else{
          editor = $.summernote.eventHandler.getModule('editor');
        }
        var $editable = $('.note-editable');
        editor.insertText($editable, createVariableTag(variable));
      });
    }
  };

  $scope.save = function() {
    var handleSuccess = function() {
      $scope.type = 'alert-success';
      $scope.message = 'Template successfuly saved';
      $timeout(function() {
        $state.go('admin.templates');
        spinner.stopSpinner();
      }, 1000);
    };
    var handleFail = function() {
      $scope.type = 'alert-danger';
      $scope.message = 'Cant update template. Please try again later.';
      spinner.stopSpinner();
    };
    spinner.startSpinner();
    if ($scope.isEdit) {
      Template.update({id: $scope.template._id}, angular.copy($scope.template), handleSuccess, handleFail);
    } else {
      Template.save({id: null}, angular.copy($scope.template), handleSuccess, handleFail);
    }
  };
});
