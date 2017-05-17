'use strict';
/* global angular */
/*jshint -W083 */

angular.module('grcApp').controller('HelpCtrl', function() {

});

angular.module('grcApp').controller('HelpListCtrl', function($scope, $state, $stateParams, HelpPages, $timeout, pageTypes) {
  HelpPages.list({}, function(result) {
    if (result && result.length) {
      $scope.helpPages = _.sortBy(result, 'order');
    }
  });

  $scope.remove = function(id, index){
    HelpPages.remove({id: id }).$promise.then( function() {
        $scope.helpPages.splice(index,1);
    })
    .catch( function() {
        //$scope.errors.other = err.message;
    });
  };
  $scope.pageTypes = _.keyBy(pageTypes, 'value');	
});

angular.module('grcApp').controller('HelpEditCtrl', function($scope, $state, spinner, Upload, $stateParams, HelpPages, $timeout, pageTypes, notify, notifyTemplate) {
	$scope.pageTypes = pageTypes;
	$scope.helpPage = {};
	if ($stateParams.id) {
		spinner.startSpinner();
		HelpPages.get({id : $stateParams.id})
		.$promise.then(function(page) {
			$scope.helpPage = page;
	      	spinner.stopSpinner();
	    })
	    .catch( function() {
        	//$scope.errors.other = err.message;
    	});	
	}

	$scope.imageUpload = function (files) {
		spinner.startSpinner();
		var editor, $editable;
		$timeout(function() {
	        if ($.summernote.eventHandler.getEditor) {
	          editor = $.summernote.eventHandler.getEditor();
	        }else{
	          editor = $.summernote.eventHandler.getModule('editor');
	        }
	        $editable = $('.note-editable');
	     });

		for (var i = 0; i < files.length; i++) {
			(function  (file) {
				Upload.upload({
                    url: '/api/attachments/' + $scope.helpPage.id,
                    file: file
                }).progress(function () {
                    
                }).success(function (data) {
                	spinner.stopSpinner();
                	editor.insertImage($editable, data.url);
                }).error(function(error){
                    notify({
                        message: error.message,
                        classes: 'alert-danger',
                        templateUrl: notifyTemplate
                    });
                    spinner.stopSpinner();
                });
			})(files[i]);
		}
	};

	$scope.savePage = function  (form) {
		$scope.submitted = true;
		if (!form.$valid) {
			return;
		}
		$scope.submitted = false;
		spinner.startSpinner();
		if ($stateParams.pageType) {
			HelpPages.update({'id': $scope.helpPage.id}, $scope.helpPage)
			.$promise.then(function(page) {
			  $state.go('help.view', {'id': page._id});
		    });
		}else{
			HelpPages.save($scope.helpPage)
			.$promise.then(function(page) {
			  $state.go('help.view', {'id': page._id});
		    });
		}
	};
});

angular.module('grcApp').controller('HelpViewCtrl', function($scope, $sce, $state, spinner, $stateParams, HelpPages) {
  	if ($stateParams.id) {
		spinner.startSpinner();
		HelpPages.get({id : $stateParams.id})
		.$promise.then(function(page) {
			$scope.helpPage = page;
	      	spinner.stopSpinner();
	    });
	}
	$scope.trustAsHtml = function(string) {
	    return $sce.trustAsHtml(string);
	};
});