'use strict';
/* global angular */

angular.module('grcApp')

.controller('CommentsController', function ($scope, $stateParams, $state, $filter, Comment) {
    $scope.commentsIsLoading = true;
    $scope.isAvaliable = true;
    $scope.commentBody = '';
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
        Comment.query({
            refEntityId: refEntityId,
            refEntityIdType : $scope.entityType
        }).$promise.then(function (collection) {
            $scope.commentsList = $filter('reverse')(collection);
            $scope.commentsIsLoading = false;
        });
    } else {
        $scope.isAvaliable = false;
        $scope.commentsList = [];
        $scope.commentsIsLoading = false;
    }

    $scope.addComment = function(form) {
        $scope.submitted = true;
        $scope.comment = {
            refEntityId: refEntityId,
            text: $scope.commentBody
        };

        if(form.$valid) {
            $scope.commentsIsLoading = true;
            Comment.save(angular.copy($scope.comment)).$promise.then( function(result) {
                $scope.commentsList.push(result);
                $scope.commentBody = '';
                $scope.submitted = false;
                $scope.commentsIsLoading = false;
            })
            .catch( function(err) {
                $scope.errors.other = err.message;
            });
        }
    };

    $scope.removeComment = function(commentId, index) {
        $scope.commentsIsLoading = true;
        Comment.remove({commentId: commentId }).$promise.then( function() {
            $scope.commentsList.splice(index,1);
            $scope.commentsIsLoading = false;
        })
        .catch( function(err) {
            $scope.errors.other = err.message;
        });
    };

});