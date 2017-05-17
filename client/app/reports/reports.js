'use strict';
/* global angular */

angular.module('grcApp')

.config(function ($stateProvider) {
	$stateProvider
	.state('reports', {
		abstract: true,
		url: '/reports',
		templateUrl: "components/common/views/content.html",
		controller: 'reportsCtrl',
		authenticate: true
	})
	.state('reports.governance_matrix', {
		url: '/governance_matrix',
		templateUrl: 'app/reports/governance-matrix.html',
		controller: 'governanceMatrixCtrl',
		authenticate: true
	})
	.state('reports.risk-analytics', {
		url: '/risk-analytics',
		templateUrl: 'app/reports/dashboard.html',
		controller: 'governanceDashboardCtrl',
		authenticate: true
	})
});