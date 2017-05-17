'use strict';
/* global angular */

angular.module('grcApp')
.config(function ($stateProvider) {
	$stateProvider
    .state('review', {
        url: '/review',
        templateUrl: "components/common/views/content.html",
        controller: 'ReviewCtrl',
        authenticate: true
    })
    .state('review.list', {
        url: '/list',
        templateUrl: 'app/review/review-list.html',
        controller: 'ReviewListCtrl',
        authenticate: true
    })
    .state('review.new', {
        url: '/new',
        templateUrl: 'app/review/review-edit.html',
        controller: 'ReviewEditCtrl',
        authenticate: true
    })
    .state('review.view', {
		url: '/:reviewId',
		templateUrl: 'app/review/review-view.html',
		controller: 'ReviewViewCtrl',
        authenticate: true
	})
    .state('review.edit', {
        url: '/:reviewId/edit',
        templateUrl: 'app/review/review-edit.html',
        controller: 'ReviewEditCtrl',
        authenticate: true
    });

})

.filter('hideClosed', function() {
    return function(arr, hide) {
        if ( !hide ) { return arr; }

        var narr = [];
        angular.forEach(arr, function(item) {
            if ( item.status !== 'Closed' ) {
                this.push(item);
            }
        }, narr);
        return narr;
    };
})

.value(
	'ReviewTemplate',
    {
        'responsibleOrg': '',
        'title': '',
        'scheduleType': '',
        'reviewType': '',
        'status': '',
        'description': '',
        'participantList': [],
        'controlsForReview': [],
        'recordsForReview': []
    }
);