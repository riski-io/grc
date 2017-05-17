'use strict';
/* global angular */

angular.module('grcApp')

.controller('HistoryController', function ($scope, $stateParams, History) {
    $scope.historyLoading = true;

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
        History.getVersions({refEntityId: refEntityId}).$promise.then(function (collection) {
            $scope.entityChangesList = collection;
            $scope.historyLoading = false;
        });
    }

});