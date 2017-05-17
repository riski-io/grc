'use strict';

var _ = require('lodash');
var async = require('async');
var logger = require('../../lib/logger');
var OrgUnitController = require('../organisation-unit/org-unit.controller');
var OrgUnit = require('../organisation-unit/org-unit.model');
var esClient = require('../../lib/elasticsearch').client;

var Control = require('../control/control-schema');
var Review = require('../review/review-schema');
var ActionItem = require('../actionitem/actionitem-schema');
var Governancerecord = require('../governancerecord/governancerecord-schema');
var AuditHistory = require('../audithistory/audithistory-schema');

var moment = require('moment');

var validationError = function(res, err) {
  return res.status(422).send(err);
};

/**
 * @apiDefine NoAccessRightError
 *
 * @apiError NoAccessRight User doesn't have permission or doesn't have required org unit membership to perform the action.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "error": "NoAccessRight"
 *     }
 */

/**
 * @api {get} /api/search/:query/:start/:size  - Governance System Cloud Search
 * @apiVersion 0.1.0
 *
 * @apiName Search
 * @apiGroup Search
 * @apiPermission member/manager/admin
 *
 * @apiDescription Governance System Cloud Search
 *
 * @apiParam {String}   query                 Search Query
 * @apiParam {String}   start                 Start Index
 * @apiParam {String}   size                  Expected Response Array Size
 * @apiParam {String}   filter                Search Filter - Example Facet Filters
 *
 *
 * @apiSuccess {Object} hits                     Search Hits
 * @apiSuccess {Object} status                   Search status
 * @apiSuccess {Object} facets                   Search facets
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 204 OK
 *
 * @apiUse NoAccessRightError
 */


exports.search = function(req, res) {
  var queryString = req.params.query || '*';
  var highlight = req.query.highlight;
  var aggregations = req.body.aggregations;
  var from = req.query.start || 0;
  var type = req.query.type;
  var filters = req.body.filters;
  var size = req.query.size;
  var user = req.user;
  var orgFilter = {};
  var searchConfig = {
    index : 'grc'
  };
  if (type) {
    searchConfig.type = type;
  }

  var queryFilters = [];
  var filter = {};

  if (filters.orgUnitId) {
    if (filters.includeChildren) {
        filter.term = {
          'parentOrgs.id' : filters.orgUnitId
        };
        delete filters.includeChildren;
    }else{
        filter.term = {
          orgUnitId : filters.orgUnitId
        };
    }
    queryFilters.push(filter);
    orgFilter = filter;
    delete filters.orgUnitId;
  }
  if (type === 'compliance-form-template' && filters.responsibleUsers) {
      if (_.isString(filters.responsibleUsers)) {
        filter = {
          term : {}
        };
        filter.term.responsibleUsers = filters.responsibleUsers;
      }else{
        filter = {
          terms : {}
        };
        filter.terms.responsibleUsers = filters.responsibleUsers;
      }
      queryFilters.push(filter);
  }
  _.forOwn(filters, function (value, key) {
    if (key === 'controlledRating') {
      key = 'overallAssessment.controlledRating';
    }
    if (!_.isEmpty(value)) {
      var filter = {};
      if (_.isString(value)) {
        filter.term = {};
        filter.term[key] = value;
      }else{
        filter.terms = {};
        filter.terms[key] = value;
      }
      queryFilters.push(filter);
    }
  });

  var queryObj = {
    "bool" : {
      "must": [
        {
          "query_string": {
            "query": "*",
            "analyze_wildcard": true
          }
        },
        {
          "range": {
            "updatedAt": {
              "gte": 1423045985218,
              "lte": 1486204385218,
              "format": "epoch_millis"
            }
          }
        }
      ],
      "filter" : queryFilters,
      "must_not": []
    }
  };

  var body = {
    "from" : from,
    "size" : size,
    "query": queryObj
  };

  if (highlight) {
    body.highlight = {
      "fields": {
        "title": {
          "require_field_match" : false
        },
        "description": {
          "require_field_match" : false
        },
        "actionRequired": {
          "require_field_match" : false
        },
        "assessment.risk": {
          "require_field_match" : false
        }
      }
    };
  }

  if (aggregations) {
    body.aggs = aggregations;
  }
  searchConfig.body = body;

  if (user.role !== 'admin') {
    OrgUnitController.getOrgMemberships(user._id, user.role, function (err,orgs) {
      var memberships = _.map(orgs, 'orgUnitId') || [];
      var orgList;
      if (!memberships.length) {
        return validationError(res , new Error('No org memberships'));
      }
      if (_.isEmpty(orgFilter) ) {
        orgList = memberships;
        var filter = {
          terms : {
            'parentOrgs.id' : orgList
          }
        };
      }else{
        orgList = [orgFilter.term.orgUnitId || orgFilter.term['parentOrgs.id']];
        var isSubset = (orgList.length === _.intersection(orgList, memberships).length);
        if (!isSubset) {
          return validationError(res , new Error('Some of the org units are not part of memberships'));
        }
      }
      queryObj.bool.filter = queryFilters;
      body.query = queryObj;
      searchConfig.body = body;
      esClient.search(searchConfig, function (error, results) {
        if (error) {
          logger.error(error);
          return validationError(res, new Error('Error in search'));
        }
        res.send(results);
      });    
    });
  }else{
    esClient.search(searchConfig, function (error, results) {
      if (error) {
        logger.error(error);
        return validationError(res, new Error('Error in search'));
      }
      res.send(results);
    });  
  }
};


function getAggregationsForVisualize (req, res, callback) {
  var aggregations = req.body.aggregations;
  
  var filters = req.body.filters;
  var orgFilter = req.body.orgFilter;
  var user = req.user;
  var type = req.query.type;
  var searchConfig = {
    index : 'grc'
  };
  if (type) {
    searchConfig.type = type;
  }

  OrgUnitController.getOrgMemberships(user._id, user.role, function (err,orgs) {
    var memberships = _.map(orgs, 'orgUnitId');
    var orgList;
    if (user.role !== 'admin') {
      if (_.isEmpty(orgFilter)) {
        orgFilter = {
          terms : {
            orgUnitId : memberships
          }
        };
        if (memberships && !memberships.length) {
          return callback(new Error('No org memberships'));
        }
      }else{
        var filterTerm = orgFilter.term || orgFilter.terms;
        if (filterTerm) {
          orgList = filterTerm.orgUnitId || filterTerm['parentOrgs.id'];
          if (orgList && _.isString(orgList)){
            orgList = [orgList];
          }
        }
        var isSubset = (orgList.length === _.intersection(orgList, memberships).length);
        if (!isSubset) {
          return callback(new Error('Some of the org units are not part of memberships'));
        }
      }
      filters.push(orgFilter);
    }

    var queryObj = {
      "bool" : {
        "must": [
          {
            "query_string": {
              "query": "*",
              "analyze_wildcard": true
            }
          },
          {
            "range": {
              "updatedAt": {
                "gte": 1423045985218,
                "lte": 1486204385218,
                "format": "epoch_millis"
              }
            }
          }
        ],
        "filter" : filters,
        "must_not": []
      }
    };
    var body = {
      "size" : 0,
      "query": queryObj
    };

    if (aggregations) {
      body.aggs = aggregations;
    }
    searchConfig.body = body;
    esClient.search(searchConfig, function (error, results) {
      if (error) {
        logger.error(error);
        return callback(new Error('Error in search'));
      }
      callback(null, results);
    });    
  });
}


exports.visualize = function(req, res) {
  getAggregationsForVisualize(req, res, function (error, results) {
    if (error) {
      return validationError(res , error);
    }
    res.json(results);
  });
};

function mergeRecursiveAndAverage(obj1, obj2, isMax) {
  for (var p in obj2) {
    try {
      if ( obj2[p].constructor === Object ) {
        obj1[p] = mergeRecursiveAndAverage(obj1[p], obj2[p], isMax);
      } else {
        if (obj1[p] === 0 || obj1[p]) {
          if (isMax) {
            obj1[p] = Math.max(obj1[p], obj2[p]);
          }else{
            obj1[p] = (obj1[p] + obj2[p])/2;
          }
        }else{
          obj1[p] = obj2[p];
        }
      }
    } catch(e) {
      obj1[p] = obj2[p];
    }
  }
  return obj1;
}


exports.hierarchyBrowser = function(req, res) {
  var orgFilter = req.body.orgFilter;
  var isMax = true;
  var orgUnitId = orgFilter.term['parentOrgs.id'];
  if (!orgUnitId) {
    return validationError(res , new Error("Org unit is missing"));
  }
  getAggregationsForVisualize(req, res, function (error, results) {
    if (error) {
      return validationError(res , error);
    }
    var aggregations = results.aggregations;
    var orgMap = {};
    try{
      _.forEach(aggregations.orgUnit.buckets, function (bucket) {
        var ratings = {};
        var openRecords = 0;
        var openActionItems = 0;
        _.forEach(bucket.records.category.buckets, function (category) {
          ratings[category.key] = category.ratings.value;
        });
        _.forEach(bucket.records.status.buckets, function (status) {
          openRecords += status.doc_count;
        });
        _.forEach(bucket.actionItems.status.buckets, function (status) {
          openActionItems += status.doc_count;
        });
        orgMap[bucket.key] = {
          ratings : ratings,
          openRecords : openRecords,
          openActionItems : openActionItems
        };
      });
      OrgUnit.findById(orgUnitId, "orgName orgCode, parent")
      .exec(function(err, orgUnit){
        if (error) {
          logger.error(error);
          return res.status(500).send(error);
        }
        OrgUnitController.getChildOrgs(orgUnitId, function (err, orgUnits) {
          if (error) {
            logger.error(error);
            return res.status(500).send(error);
          }
          orgUnits.push(orgUnit);
          var units = _.keyBy(orgUnits, "orgUnitId");
          _.forOwn(units, function (unit, id) {
            unit = unit.toJSON();
            unit.parent = unit.parent && unit.parent.toString();
            if (orgMap[id]) {
              if (!unit.aggregations && orgMap[id]) {
                unit.aggregations = orgMap[id];
              }else{
                unit.aggregations.openRecords = unit.aggregations.openRecords || 0;
                unit.aggregations.openActionItems = unit.aggregations.openActionItems || 0;
                unit.aggregations.openRecords = unit.aggregations.openRecords + orgMap[id].openRecords;
                unit.aggregations.openActionItems = unit.aggregations.openActionItems + orgMap[id].openActionItems;
                unit.aggregations.ratings = mergeRecursiveAndAverage(unit.aggregations.ratings, orgMap[id].ratings, isMax);
              }
              if (unit.parent && units[unit.parent] && units[unit.parent].aggregations) {
                units[unit.parent].aggregations.openRecords = units[unit.parent].aggregations.openRecords || 0;
                units[unit.parent].aggregations.openActionItems = units[unit.parent].aggregations.openActionItems || 0;
                units[unit.parent].aggregations.openRecords = units[unit.parent].aggregations.openRecords + unit.aggregations.openRecords;
                units[unit.parent].aggregations.openActionItems = units[unit.parent].aggregations.openActionItems + unit.aggregations.openActionItems;
                units[unit.parent].aggregations.ratings = mergeRecursiveAndAverage(units[unit.parent].aggregations.ratings, unit.aggregations.ratings, isMax);
              }else if(unit.parent && units[unit.parent]){
                units[unit.parent].aggregations = _.clone(unit.aggregations);
              }
            }
            units[id] = unit;
          });
          OrgUnitController.getOrgTree(_.toArray(units), function (orgTree) {
            res.status(200).send(orgTree);
          });
        });
      });
    }catch(error){
      logger.error(error);
      return res.status(500).send(error);
    }
  });
};

/**
 * @api {get} /api/search/delete-search-documents  - Clear All Cloud Search Documents
 * @apiVersion 0.1.0
 *
 * @apiName ClearCloudSearchDocuments
 * @apiGroup Search
 * @apiPermission admin
 *
 * @apiDescription Clear all Governance System Cloud Search Documents -  Should be used with caution
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 204 OK
 *
 * @apiUse NoAccessRightError
 */
/*exports.clearAllSearchDocuments = function (req, res) {
  searchUtils.clearDocuments(function (err, data) {
    res.json(data);
  });
};*/

function noop(){}

function getMonthDateRange(year, month) {
    var startDate = moment([year, month]).add(-1,"month");
    var endDate = moment(startDate).endOf('month');
    return { start: startDate.format(), end: endDate.format() };
}

function fillPerformanceIndex () {

}

function addToHistory (model, type) {
  AuditHistory.addToHistory({
    refEntityId : model.id,
    refEntityType : type,
    changeDate : model.updatedAt,
    snapshot : model.toJSON()
  }, noop);
}

exports.reIndex = function (req, res) {
  async.parallel([
      function(callback){
        Governancerecord.find({})
         .populate('nominatedReviewer responsibleUser responsibleOrg')
         .exec(function (err, records) {
          async.each(records, function (record, cb) {
            addToHistory(record, 'governancerecord');
            record.save(cb);
          }, function(err){
              callback(err);
          });
         });
      },
      function(callback){
       ActionItem.find({})
       .populate('assignedTo createdBy responsibleOrg')
       .exec(function (err, actionItems) {
          async.each(actionItems, function (actionItem, cb) {
            addToHistory(actionItem, 'actionitem');
            actionItem.save(cb);
          }, function(err){
              callback(err);
          });
        });
      },
      function(callback){
        Control.find({})
        .populate('responsibleOrg responsibleUser')
        .exec(function (err, controls) {
          async.each(controls, function (control, cb) {
            addToHistory(control, 'control');
            control.save(cb);
          }, function(err){
              callback(err);
          });
        });
      },
      function(callback){
          Review.find({})
          .populate('responsibleOrg scheduledBy')
          .exec(function (err, reviews) {
            async.each(reviews, function (review, cb) {
              addToHistory(review, 'review');
              review.save(cb);
            }, function(err){
                callback(err);
            });
          });
      }
/*      function(callback){
        AuditHistory.find({})
         .exec(function (err, list) {
          async.each(list, function (record, cb) {
            record.save(cb);
          }, function(err){
              callback(err);
          });
         });
      }*/
  ], function (err, result) {
    res.sendStatus(200);
  });
};