"use strict";
var bodybuilder = require('bodybuilder')

exports.report = function(req, res) {
/*	var queryBody = req.body;
	var query_string =  queryBody.query_string || "*";
	var match =  queryBody.match;
	var filters = queryBody.filters;
	var aggregations = queryBody.aggregations;

	var body = bodybuilder()
	body.query('query_string', 'query', query_string);

	if (match && match.field && match.val) {
		body.query('match', match.field, match.val)
	}

	if (filters && _.isArray(filters)) {
		_.forEach(filters, function (filter) {
			if (filter && filter.field && filter.val && _.isArray(filter.val)) {
				body.filter('terms', filter.field, filter.val);
			}
		});
	}

	body.aggregation('terms', 'orgUnitName', 'orgUnit', function (agg) {
		agg.aggregation('sum', 'overallAssessment.controlledCost', 'cost');
		agg.aggregation('terms', 'category', 'category', {
			size : 10,
			order : {
				cost : 'desc'
			}
		}, function  (agg) {
			agg.aggregation('sum', 'overallAssessment.controlledCost', 'cost');
			return agg;
		});
		return agg;
	});
	if (aggregations && _.isArray(aggregations)) {
		let i = 0;

	  body.aggregation(aggregations[i].type, aggregations[i].field, aggregations[i].name, aggregations[i].opts, aggregations[i].nested  && (agg) => {
	    var index = 0;
	    var nestedAgg;
	    function makeNestedAgg(aggBuilder, aggregations[i]) {
	      if (!nested]) return nestedAgg;
	      var type = nested.aggregationType;
	      var field = statements[index].aggregationField;
	      index++;
	      return aggBuilder.aggregation(nested.type, nested.field, nested.name, nested.opts, (agg) => makeNestedAgg(nestedAgg = agg, ));
	    }
	    if (aggregations[i].nested[index]) {
	    	agg = makeNestedAgg(agg, aggregations[i].nested[index]);
	    }
	    _.forEach(aggregations[i].nested, function (nested) {
	    	agg = makeNestedAgg(agg, nested);
	    })
	    return agg;

	  }) 
	}*/
};