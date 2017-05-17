'use strict';

var flatten = require('flat');
var _ = require('lodash');
var json2csv = require('json2csv');
var csvFields = require('./fields');

exports.csv = function (type, res, data) {
    if (type === 'records') {
      data = processRecordsForExport(data);
    }else{
      data = flattenDataItems(data);
    }
    var fields = csvFields[type];
    if (!fields) 
      return res.status(422).send(new Error ('Fields are not defined'));
    res.set({
      'Content-disposition': 'attachment; filename=' + type + '.csv',
      'Content-Type': 'text/csv'
    });
    json2csv({
      data: data,
      fields: fields
    }, function(err, csv) {
      if (err) {
        return res.status(422).send(err);
      } else {
        return res.status(200).send(csv);
      }
    });
};

function flattenDataItems (data) {
  return _.map(data, flatten) ;
}

function processRecordsForExport (records) {
  var csvRecords = [];
  _.forEach(records, function (record) {
      var csvExport = [];
      var assessments = record.assessment || [];
      var externalFactors = record.externalFactors || [];
      delete record.assessment;
      delete record.externalFactors;
      csvExport.push(record);
      _.forEach(externalFactors, function  (factor, index) {
        csvExport[index] = csvExport[index] || {};
        csvExport[index].externalFactors = factor;
      });
      var controlIndex = 0;
      _.forEach(assessments, function (assessment, index) {
        var controls = assessment.controls || [];
        csvExport[controlIndex] = csvExport[controlIndex] || {};
        if(assessment.controls)
          delete assessment.controls;
        csvExport[controlIndex].assessment = assessment;
        _.forEach(controls, function (data, i) {
          var control = data.control;
          control.effectiveness = data.effectiveness;
          
          csvExport[controlIndex] = csvExport[controlIndex] || {};
          csvExport[controlIndex].assessment = csvExport[controlIndex].assessment || {};
          csvExport[controlIndex].assessment.controls = control;
          controlIndex++;
        });
      });
    _.forEach(csvExport, function (obj) {
      csvRecords.push(flatten(obj));
    }); 
  });
  return csvRecords;
}