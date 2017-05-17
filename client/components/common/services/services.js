'use strict';
/* global angular */
/* global saveAs */
/*jshint -W061 */
var spinnerVisible = false;
angular.module('grcApp')

.factory('RestService', function($resource) {
	return {
		record: $resource('/api/governance-records/:id', { id: '@_id' }, {
			update: { method: 'PUT' }
		}),
		control: $resource('/api/controls/:id', { id: '@_id' }, {
			update: { method: 'PUT' }
		}),
		records: $resource('/api/governance-records'),
		reviews: $resource('/api/reviews'),
	    unit: $resource('/api/organisation-units/:orgUnitId/:userId/:role', {orgUnitId: '@orgUnitId' , userId : '@userId' , role : '@role'}, {
	      update: {
	        method: 'PUT'
	      }
	    }),
		unitByUser: $resource('/api/organisation-units/by-user/:id', { id: '@_id' }),
		invitation : $resource('/api/organisation-units/invitations/:orgUnitId' , { orgUnitId : '@orgUnitId'})
	};
})

.factory('RisksService', function () {
	return {
		getAll: function (recordArr) {
			var risks = [];
		    angular.forEach(recordArr, function(rec) {
		    	rec = rec._source || rec;
		    	if ( rec.assessment && rec.assessment.length && rec.assessment[0] ) {
				    angular.forEach(rec.assessment, function(as) {
						var risk = angular.copy(as);
						risk.fromRecord = rec.id;
						risk.status = rec.status;
						if (rec.responsibleOrg) {
							risk.unit = rec.responsibleOrg.orgName || '';
						}
						if (rec.identifiedAt) {
							risk.reviewType = rec.identifiedAt.reviewType || '';
						}
						risks = risks.concat(risk);
				    });
		        }
		    });
	    	return risks;
		},
		getMatrixRecords: function (recordArr) {
			var risks = [];
		    angular.forEach(recordArr, function(rec) {
		    	if (rec.overallAssessment) {
					var risk = angular.copy(rec);
					risk.fromRecord = rec.recordId;
					risk.unit = '';
					risk.reviewType = '';
					risk.status = rec.status;
					if (rec.responsibleOrg) {
						risk.unit = rec.responsibleOrg.orgName;
					}
					if (rec.identifiedAt) {
						risk.reviewType = rec.identifiedAt.reviewType;
					}
					risk.overallAssessment = {
						consequence: +rec.overallAssessment.controlledConsequence,
						cost: +rec.overallAssessment.controlledCost,
						likelihood: +rec.overallAssessment.controlledLikelihood,
						rating: +rec.overallAssessment.controlledRating
					};
					risks.push(risk);
		        }
		    });
	    	return risks;
		}
	};
})

.factory('FileSaveService', function($filter, spinner, $http, $rootScope) {

	function prettifyDates(k, v) {
		if ( k === 'updatedAt' || k === 'createdDate' || k === 'effectiveFrom' || k === 'effectiveTo' ) {
			if (!v) {
				return '';
			}
			return $filter('date')(v, 'short');
		}
		return v || '';
	}

	function prepareCsvData(d, cols) {
		var data = angular.copy(d),
			arr = [];
	    angular.forEach(data, function(item) {
	    	var obj = {};
		    angular.forEach(cols, function(col) {
		    	var parts = col.key.split('.'),  str = 'item', i = 0;
		    	var noprop = false;  // TODO change this later
		    	if ( parts.length > 1 ) {
			        for ( i = 0; i < parts.length; i++ ) {
			        	str += '["' + parts[i] + '"]';
			        	if ( !eval(str) ) { // TODO change this later
			        		noprop = true;
			        		break;
			        	}
			        }
			        if ( noprop ) {// TODO change this later
			        	obj[col.title] = '';
			        }else {
			        	obj[col.title] = eval(str);
			        }
		    	}else {
		    		obj[col.title] = prettifyDates(col.key, item[col.key]);
		    	}
		    });
		    this.push(obj);
	    }, arr);
	    return arr;
	}

	function toCSV(data, title, nolabel) {
	    var arr = ( typeof data !== 'object' ) ? JSON.parse(data) : data,
	    	i = 0,
	    	len = arr.length,
	    	row = '',
	    	CSV = '',
	    	index;

		//if ( title ) { CSV += title + '\r\n'; }

	    if ( !nolabel ) {
	        for ( index in arr[0] ) { row += index + ','; }
	        row = row.slice(0, -1);
	        CSV += row + '\r\n';
	    }

	    for ( ; i < len; i++ ) {
	        row = '';
	        for ( index in arr[i] ) { row += '"' + arr[i][index] + '",'; }
	        row.slice(0, -1);
	        CSV += row + '\r\n';
	    }

	    return CSV;
	}

	return {
		csv: function (arr, config) {
			var d = new Date(),
				formatted = $filter('date')(d, 'yyyy-MM-dd'),
	    		name = config.nameSuffix + formatted + '.csv',
	    		prepared = prepareCsvData(arr, config.model),
	    		csvData = toCSV(prepared, name),
	    		blob = new Blob([csvData], {type: 'text/csv;charset=utf-8'});
			saveAs(blob, name);
		},
		exportAsCSV: function (url, fileName, method, body) {
		    spinner.startSpinner();
		    var a = document.querySelector('#export-data');
		    if (!a) {
		      a = document.createElement('a');
		      document.body.appendChild(a);
		      a.setAttribute('style', 'display: none');
		      a.setAttribute('id', 'export-data');
		    }
		    var request;
		    if (method && method === 'POST') {
		    	request = $http.post(url, body);
		    }else{
		    	request = $http.get(url);
		    }
		    request.success(function (data) {
		      var blob = new Blob([ data ], { type : 'text/csv' });
		      var url = (window.URL || window.webkitURL).createObjectURL( blob );
		      if ($rootScope.isIE) {
		      	window.navigator.msSaveBlob(blob, fileName+'.csv'); 
		      }else{
			      a.href = url;
			      a.download = fileName+'.csv';
			      a.click();
		      }
		      spinner.stopSpinner();

		    })
		    .error(function () {
		      spinner.stopSpinner();
		    });
		},
		pdfDownload :  function (arr, orgUnit, image, type, spinner) {
		  var data = {};
	      if (orgUnit) {
	      	data.orgUnit = 	JSON.stringify(orgUnit);
	      }
	      if (image) {
	      	data.image = JSON.stringify(image);
	      }
	      if (_.isArray(arr)) {
	      	data.items = JSON.stringify(arr);
	      }else{
	      	data.item = JSON.stringify(arr);
	      }
	      spinner.startSpinner();
	      $.fileDownload('/api/pdf/generate/'+type, {
	          httpMethod: 'POST',
	          data: data,
	          successCallback: function () {
	            spinner.stopSpinner();
	          },
	          failCallback: function () {
	            spinner.stopSpinner();
	          }
	      });
		}
	};
})

.factory('SvgConvertService', function() {
	return {
		convert: function (svgid, callback) {
			var svg = document.getElementById(svgid),
				bcr = svg.getBoundingClientRect(),
				width = bcr.width,
				height = bcr.height;
			if (callback) {
				svg.toDataURL('image/jpeg', { 
					renderer : 'canvg',
					callback: function (data) {
						callback({
							width: width,
							height: height,
							data: data
						});
					}
				});
			}
		}

	};
})

.factory('EntityId', function ($stateParams) {
    var refEntityId = null;

    return {
        get: function () {

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

            return refEntityId;
        },
        getType: function () {
            var entityType = '';

            if ($stateParams.reviewId) {
                entityType = 'Review';
            }
            if ($stateParams.recordId) {
                entityType = 'Governance Record';
            }
            if ($stateParams.controlId) {
                entityType = 'Control';
            }
            if ($stateParams.actionItemId) {
                entityType = 'Action Item';
            }

            return entityType;
        }
    };
})

.factory('spinner', function() {
    function startSpinner() {
        if (!spinnerVisible) {
            $('div#spinner').fadeIn('slow');
            $('.spinner-backdrop').fadeIn('slow');
            spinnerVisible = true;
        }
    }

    function stopSpinner() {
        if (spinnerVisible) {
            var spinner = $('div#spinner');
            spinner.fadeOut('slow');
            $('.spinner-backdrop').fadeOut('slow');
            spinnerVisible = false;
        }
    }
  return {
    startSpinner: startSpinner,
    stopSpinner: stopSpinner
  };
})

.factory('OrgUnits', function($resource, $cacheFactory, $http, $rootScope, RestService, $q) {
	var cache = $cacheFactory('orgUnits');
	$rootScope.orgCache = cache;
	var orgUnit = $resource('/api/organisation-units/:orgUnitId', { orgUnitId : '@orgUnitId'});

	  function buildTree(array, parent, tree) {
	    tree = typeof tree !== 'undefined' ? tree : [];
	    parent = typeof parent !== 'undefined' ? parent : {
	      orgUnitId: undefined
	    };
	    var children = _.filter(array, function(child) {
	      return child.parent === parent.orgUnitId;
	    });
	    if (!_.isEmpty(children)) {
	      if (!parent.orgUnitId) {
	        tree = children;
	      } else {
	        parent.items = children || [];
	      }
	      _.each(children, function(child) {
	        buildTree(array, child);
	      });
	    } else {
	      parent.items = [];
	    }
	    return tree;
	  }

	return {
		getOrgTree : function () {
			var deferredProfile = $q.defer();
			if ($rootScope.orgTree) {
			  deferredProfile.resolve();
			}else{
				RestService.unit.query({}, function(result) {
				  if (result && result.length) {
				    $rootScope.orgTree = buildTree(result);
				    if (!$rootScope.defaultOrgUnit) {
				      $rootScope.defaultOrgUnit = $rootScope.orgTree[0];
				    }
				  }
				  deferredProfile.resolve();
				});
			}
			return deferredProfile.promise;
		},

		getAllUnits: function() {
			var orgUnits;
			if (cache) {
				orgUnits = cache.get('orgUnits');
			}
			if (!orgUnits) {
				orgUnits = orgUnit.query();
				cache.put('orgUnits', orgUnits);
			}
			return orgUnits;
		},
		getAllOrgUnits : function () {
			return orgUnit.query({all : true});
		},
		getEntities : function (url , data , successCB , errorCB) {
		    $http.post(url, data).
		    success(successCB).
		    error(errorCB);
	    },
	    getAllAdmins : function (successCB , errorCB) {
	    	var url = '/api/users/get-all-admins';
	    	$http.get(url).
		    success(successCB).
		    error(errorCB);
	    },
	    getOrgUnit : function (orgUnitId) {
	    	return orgUnit.get({orgUnitId:orgUnitId});
	    },
		getChidlren : function (orgUnit) {
			function findchildren (orgUnits, children) {
				children = _.union(children, orgUnits);
				var units = _.flatten(_.map(orgUnits, function(obj){return obj.items;}));
				var items = [];
				_.forEach(units, function (item) {
					if (item.items.length > 0) {
						items.push(item);
					}else{
						children.push(item);
					}
				});

				if (items.length > 0) {
					return findchildren(items, children);
				}else{
					return _.map(children, 'orgUnitId');
				}
			}

			if (orgUnit.items.length) {
				return findchildren(orgUnit.items);
			}else{
				return [];
			}
		}
	};
});