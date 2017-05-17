'use strict';

var Attachment = require('./attachment.model');
var _ = require('lodash');
var moment = require('moment');
var formidable = require('formidable');
var s3 = require('../../lib/s3');

var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list
 * restriction: 'user'
 */
exports.getAttachments = function(req, res) {
  var refEntityId = req.params.refEntityId;
  Attachment.find({'refEntityId' : refEntityId})
  .populate('publishedBy')
  .exec(function (err, attachments) {
     if (err) return res.send(404 , "Attachment does not exist");
    _.forEach(attachments , function (attachment) {
      attachment.url = s3.getSignedUrl(attachment.s3key);
    });
    return res.json(attachments);
  });
};


/**
 * Creates a new attachment
 */
exports.create = function (req , res) {
  var refEntityId = req.params.refEntityId;
  if (!refEntityId) {
    return validationError(res, new Error('refEntityId is not specified'));
  }
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
      // `file` is the name of the <input> field of type `file`
      if (!files.file) {
        return validationError(res, new Error('Name of the input field should be "file"'));
      }
      s3.uploadFile(refEntityId , files.file , function (err , data , params) {
        if (err) {
          return validationError(res, err);
        }
        var json = {
          refEntityId : refEntityId,
          displayName : files.file.name,
          s3key : params.Key
        };
        json.publishedBy = req.user.userId;
        var attachment = new Attachment(json);
        attachment.save(function(err, attachment) {
          if (err) return res.send(500, err);
          if (!attachment) return res.send(401, err);
          attachment.url = s3.getSignedUrl(attachment.s3key);
          return res.json(attachment);
        });
      });
  });
};

/**
 * Get Attachment By Id
 * restriction: 'user'
 */
exports.getAttachment = function(req, res) {
  var refEntityId = req.params.refEntityId;
  var attachmentId = req.params.attachmentId;
  if (!refEntityId || !attachmentId) {
    return validationError(res, new Error('refEntityId or attachmentId is not specified'));
  }
  Attachment.findById(attachmentId, function(err, attachment) {
    if (err) return res.send(500, err);
    if (!attachment) return res.send(404, new Error('Attachment not found'));
    attachment.url = s3.getSignedUrl(attachment.s3key);
    return res.json(attachment);
  });
};


/**
 * Deletes a attachment
 * restriction: 'user'
 */
exports.destroy = function(req, res) {
  var refEntityId = req.params.refEntityId;
  var attachmentId = req.params.attachmentId;
  if (!refEntityId || !attachmentId) {
    return validationError(res, new Error('refEntityId or attachmentId is not specified'));
  }
  Attachment.findById(attachmentId, function(err, attachment) {
    if (err) return res.send(500, err);
    if (!attachment) return res.send(401, err);
    s3.remove(attachment.s3key , null , function (err , data) {
      if (err) {
        return validationError(res, err);
      }
      attachment.remove(function(err) {
        if (err) {
          return res.send(401, err);
        }
        return res.send(204);
      }); 
    });
  });
};