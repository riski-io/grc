'use strict';

var crypto = require('crypto');
var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var schema = new Schema({
  display_name : String,
  givenName: String,
  familyName: String,
  email: {
    type: String,
    index: true,
    required : true
  },
  defaultOrgUnit : {
    type: Schema.Types.ObjectId, 
    ref: 'OrgUnit' 
  },
  role: {
    type: String,
    index: true
  },
  auth0 : {}
},{
  timestamps : true
});

schema.virtual('userId').get(function () {
  return this._id;
});
var User = mongoose.model('User', schema);

_.extend(User, {
  findOrCreate: function(profile, callback) {
    var User = this;
    User.findById(profile._id || profile.id, function(err, user) {
      if (err) {
          return callback(err);
      }
      if (user) {
        return callback(null, user);
      }
      user = new User(profile);
      user.save(function(err, data) {
        if (err || !data) {
          return callback(new Error('Error in creating a new user'));
        }
        return callback(null, user);
      });

    });
  },
  getAdminUsers : function (callback) {
    var self = this;
    self.find({role : 'admin'}, function(err, users) {
      if (err) {
        return callback(new Error('Error in fetching users'));
      }
      callback(null, users);
    });
  },
  addAdminUsers : function (users, callback) {
    var invalidUsers = [];
    var adminUsers = [];
    var User = this;
    async.each(users, function (userId , cb) {
      User.findById(userId , function (err , data) {
        if (err && err.code || !data) {
          invalidUsers.push(userId);
          return cb();
        }
        data.role = 'admin';
        var user = new User(data);
        user.save(function (err) {
          adminUsers.push(userId);
          cb();
        });
      });
    }, function(){
      callback(invalidUsers, adminUsers);
    });
  },
  removeAdmin : function (user, callback) {
    var User = this;
    User.findOne({userId : user} , function (err , user) {
      if (err) {
        return callback('Error in removing admin role , please try again later');
      }
      if (!user) {
        return callback('User not found');
      }
      if (user.role === 'admin') {
        user.role = 'member';
        user.save();
        callback('Admin access is removed for '+user.givenName +' '+user.familyName);
      }else{
        return callback(user.givenName +' '+user.familyName+' is not a admin');
      }
    });
  }, 
  findAll: function(callback) {
    var self = this;
    self.find({}, '-updatedAt -createdAt', function(err, users) {
      if (err) {
        return callback(new Error('Error in fetching users'));
      }
      callback(null, users);
    });
  },
  getSafeJSON: function(user) {
    if(user.hashedPassword)delete user.hashedPassword;
    if(user.hash)delete user.hash;
    if(user.lastLoggedInAt)delete user.lastLoggedInAt;
    if(user.provider)delete user.provider;
    if(user.salt)delete user.salt;
    return user;
  },
  authenticate: function(user, plainText) {
    if (!user) {
      return false;
    }
    return this.encryptPassword(plainText, user.salt) === user.hashedPassword;
  },
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },
  encryptPassword: function(password, salt) {
    if (!password || !salt) {
      return '';
    }
    var saltNew = new Buffer(salt, 'base64');
    return crypto.pbkdf2Sync(password, saltNew, 10000, 64).toString('base64');
  },
  encryptPasswordHash: function(password, salt) {
    if (!password || !salt) {
      return '';
    }
    var saltNew = new Buffer(salt, 'base64');
    return crypto.pbkdf2Sync(password, saltNew, 10000, 18).toString('hex');
  }
});

module.exports = User;
