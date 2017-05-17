"use strict";

var handlebars = require('handlebars');
var _ = require('lodash');
var async = require('async');
var path = require('path');
var templatePath = path.normalize(__dirname + '/templates/');
var fs = require('fs');
var exec = require('child_process').exec;
var moment = require('moment');
var Settings = require('../settings/settings-schema');
var actionItemController = require('../actionitem/actionitem-controller');
var controlController = require('../control/control-controller');
var logger = require('../../lib/logger');
var root = path.normalize(__dirname);
var wkhtmltopdf_path = /*process.env.PORT ? './bin/wkhtmltopdf-linux-amd64' : */'wkhtmltopdf';
require('../util/handlebarsHelpers')(handlebars);


var templateStyles = fs.readFileSync(templatePath + 'template-styles.css');
var styleBlock = '<style type="text/css">' + templateStyles.toString() + '</style>';

var riskMatrixTemplate = fs.readFileSync(templatePath + 'risk-matrix.hbs');
var riskMatrixTemplateRenderer = handlebars.compile(styleBlock + riskMatrixTemplate.toString());

var reviewTemplate = fs.readFileSync(templatePath + 'review.hbs');
var reviewTemplateRenderer = handlebars.compile(styleBlock + reviewTemplate.toString());
var reviewDetailsTemplate = fs.readFileSync(templatePath + 'review-details.hbs');
var reviewDetailsTemplateRenderer = handlebars.compile(styleBlock + reviewDetailsTemplate.toString());


var recordTemplate = fs.readFileSync(templatePath + 'governance-record.hbs');
var recordTemplateRenderer = handlebars.compile(styleBlock + recordTemplate.toString());
var recordViewTemplate = fs.readFileSync(templatePath + 'governance-record-details.hbs');
var recordViewTemplateRenderer = handlebars.compile(styleBlock + recordViewTemplate.toString());

var actionItemTemplate = fs.readFileSync(templatePath + 'action-item.hbs');
var actionItemTemplateRenderer = handlebars.compile(styleBlock + actionItemTemplate.toString());
var actionItemDetailsTemplate = fs.readFileSync(templatePath + 'action-item-details.hbs');
var actionItemDetailsTemplateRenderer = handlebars.compile(styleBlock + actionItemDetailsTemplate.toString());

var controlTemplate = fs.readFileSync(templatePath + 'control.hbs');
var controlTemplateRenderer = handlebars.compile(styleBlock + controlTemplate.toString());
var controlDetailsTemplate = fs.readFileSync(templatePath + 'control-details.hbs');
var controlDetailsTemplateRenderer = handlebars.compile(styleBlock + controlDetailsTemplate.toString());

var generatePDF = function (req, res, data, template, pdfname) {
  var html = template(data);
  var random = Math.floor(Math.random() * 90000) + 10000;
  var filename = "tmpfiles/"+random + ".html",
  protocol = req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http',
  pdf_path = "tmpfiles/"+random + '.pdf';
  var headerPath = "file://"+root+"/header.html";
  fs.writeFile(filename, html, function(err) {
    if (err){
      logger.err(err);
      return res.send(500, err);
    }
    setTimeout(function() {
      var child = exec([wkhtmltopdf_path, '--page-size A4', '--dpi 300', '--margin-top 5mm', '-T 5', '--zoom 1', '"' + filename + '"', pdf_path].join(
        ' '), function(error, stdout, stderr) {
        if (error !== null) {
          console.log('exec error: ' + error);
        }
        setTimeout(function() {
          var output = fs.readFileSync(pdf_path);
          fs.readFile(pdf_path, function(error, content) {
            if (error) {
              res.setHeader(500);
              res.end();
            } else {
              //res.send(content);
				      res.cookie('fileDownload', true);
	            res.writeHead(200, {'Content-Type' : 'pdf',
	                                'Content-Disposition': "attachment; filename=\""+pdfname+"\"" });
	            var fileStream = fs.createReadStream(pdf_path);
	            fileStream.pipe(res);
	            setTimeout(function(){
	              fs.unlinkSync(filename);
	              fs.unlinkSync(pdf_path);
	            },5000);
            }
          });
        }, 2000);
      });
    }, 0);
  });
};

exports.downloadPDFReport = function (req, res) {
  var type = req.params.type;
  var data = req.body;
  var pdfData = {};
  try{
  	for (var i in data) {
  		pdfData[i] = JSON.parse(data[i]);
  	}
  }catch(e){
  	return res.send(500, new Error(e));
  }
  var template;
  switch (type) {
    case 'governance-record':
      template = recordTemplateRenderer;
      break;
    case 'governance-record-details':
      template = recordViewTemplateRenderer;
      break;
    case 'review':
      template = reviewTemplateRenderer;
      break;
    case 'review-details':
      template = reviewDetailsTemplateRenderer;
      break;
    case 'action-item':
      template = actionItemTemplateRenderer;
      break;
    case 'action-item-details':
      template = actionItemDetailsTemplateRenderer;
      break;
    case 'control':
      template = controlTemplateRenderer;
      break;
    case 'control-details':
      template = controlDetailsTemplateRenderer;
      break;
    case 'risk-matrix':
      template = riskMatrixTemplateRenderer;
      break;
  }
  if (!template) {
  	return res.send('Template not found');
  }

  Settings.getAllSettings(function(err, settings) {
    if (err) {
      logger.error(err);
    }
    if (settings) {
      pdfData.site_url = settings.site_url;
    }
    if (type === 'governance-record-details') {
      if (pdfData && pdfData.item && pdfData.item._id) {
        var id = pdfData.item._id;
        actionItemController.getRelatedActionItems(id, function (err, actionItems) {
          pdfData.relatedActionItems = actionItems;
          generatePDF(req, res, pdfData, template, type + '.pdf');
        });
      }
    }else{
        generatePDF(req, res, pdfData, template, type + '.pdf');
    }
  });
};