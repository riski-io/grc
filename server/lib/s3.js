'use strict';

var config = require('./config');
var AWS = require('aws-sdk');
var fs = require('fs');
var mime = require('mime');
var bucket = config.s3.bucket;
var s3;

if (config.env === 'development') {
  s3 = new AWS.S3(config.aws);
}else{
  s3 = new AWS.S3();
}

exports.findAndCreateBucket = function () {
  var params = {
    Bucket: bucket, /* required */
    CreateBucketConfiguration: {
      LocationConstraint: 'ap-southeast-2'
    }
  };
  var bucketParams = {
    Bucket: bucket
  };
  s3.headBucket(bucketParams, function(err, data) {
    if (err){
      s3.createBucket(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
      });
    }else{
      console.log('S3 bucket already exists');
    }
  });
};

exports.uploadFile = function(refEntity, file, callback) {
  var path = file.path;
  var name = file.name;
  fs.readFile(path, function(err, fileBuffer) {
    var params = {
      Bucket: bucket,
      Key: refEntity + '/' + name,
      Body: fileBuffer,
      Expires : new Date(new Date().setYear(new Date().getFullYear() + 20))
    };
    s3.putObject(params, function(err, data) {
      if(err) {
         callback(err);
      } else {
        callback(null, data , params);
      }
    });
  });
};

exports.downloadFile = function(key, res, versionId) {
  var params = {
    Bucket: bucket,
    Key: key
  };
  if (versionId) {
    params.VersionId = versionId;
  }
  s3.GetObject(params, {
    stream: true
  }, function(err, data) {
    res.attachment(key);
    data.Stream.pipe(res);
  });
};

exports.getSignedUrl = function (key) {
	var params = {Bucket: bucket, Key: key , Expires: 600000000};
	return s3.getSignedUrl('getObject', params);
};

exports.getSignedUrlAsync = function (key , callback) {
	var params = {Bucket: bucket, Key: key , Expires: 600000000};
	s3.getSignedUrl('getObject', params , callback);
};

exports.remove = function (key , versionId , callback) {
  var params = {
    Bucket: bucket,
    Key: key
  };
  if (versionId) {
    params.VersionId = versionId;
  }
  s3.deleteObject(params, callback);
};