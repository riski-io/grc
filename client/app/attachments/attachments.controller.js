'use strict';
/* global angular */

angular.module('grcApp')

.controller('AttachmentsController', function ($scope, $stateParams, $state, $filter, Upload, Attachment, notify, notifyTemplate) {
    $scope.attachmentsIsLoading = true;
    $scope.isAvaliable = true;
    $scope.errors = {};

    switch ($state.current.name) {
        case 'review.new':
            $scope.entityType = 'review';
            break;
        case 'governance-record.new':
            $scope.entityType = 'record';
            break;
        case 'control.new':
            $scope.entityType = 'control';
            break;
        case 'action-item.new':
            $scope.entityType = 'action item';
            break;
    }

    var refEntityId = null;
    if ($stateParams.reviewId) {
        refEntityId = $stateParams.reviewId;
    }
    if ($stateParams.recordId) {
        refEntityId = $stateParams.recordId;
    }
    if ($stateParams.controlId) {
        refEntityId = $stateParams.controlId;
    }
    if ($stateParams.actionItemId) {
        refEntityId = $stateParams.actionItemId;
    }

    if (refEntityId) {
        Attachment.listAll({refEntityId: refEntityId}).$promise.then(function (collection) {
            $scope.loadingText = 'Loading files...';
            $scope.attachmentsList = collection;
            $scope.attachmentsIsLoading = false;
        });
    } else {
        $scope.attachmentsList = [];
        $scope.isAvaliable = false;
        $scope.attachmentsIsLoading = false;
    }

    $scope.upload = function (files) {
        $scope.loadingText = 'Adding files...';
        if (files && files.length) {
            _.forEach(files , function (file) {
                Upload.upload({
                    url: '/api/attachments/' + refEntityId,
                    file: file
                }).progress(function () {
                    $scope.attachmentsIsLoading = true;
                }).success(function (data) {
                    $scope.attachmentsList.push(data);
                    $scope.attachmentsIsLoading = false;
                    $scope.loadingText = 'Loading...';
                }).error(function(error){
                    notify({
                        message: error.message,
                        classes: 'alert-danger',
                        templateUrl: notifyTemplate
                    });
                    $scope.attachmentsIsLoading = false;
                });
            });
        }
    };

    $scope.removeFile = function(attachmentId, index) {
        $scope.loadingText = 'Removing file...';
        $scope.attachmentsIsLoading = true;
        Attachment.remove({refEntityId: refEntityId, attachmentId: attachmentId }).$promise.then( function() {
            $scope.attachmentsList.splice(index,1);
            $scope.attachmentsIsLoading = false;
        })
        .catch( function(err) {
            $scope.errors.other = err.message;
        });
    };

});