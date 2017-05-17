'use strict';

angular.module('grcApp').factory('Search', ['$http', function($http) {
	return {
		get : function (data) {
			var params = $.param(data.params);
			return $http.post('/api/search/'+data.query+'?'+params, data.body);
		},
		getAggregations : function (data, params) {
			var url = '/api/search/get-aggregations';
			if (params) {
				params = $.param(params);
				url = url +'?'+ params;
			}
			return $http.post(url, data);
		},
		getHierarchyBrowser : function (data) {
			return $http.post('/api/search/get-hierarchy-browser', data);
		}
	};
  }
]);
