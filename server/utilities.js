#!/usr/bin/env node
'use strict';
var program = require('commander');
var ad = require('./api/ad-credentials/ad-credentials.model');
var User = require('./api/user/user.model');

program
  .version('0.0.1');

program
  .command('setad')
  .description('Set Active Directory Settings')
  .option("-u, --url [url]", "Active Directory Server URL")
  .option("-d, --baseDN [DN]", "Distinguished Name")
  .option("-U, --username [username]", "LDAP username")
  .option("-P, --password [password]", "Password")
  .action(function(options){
  	if (!options.username || !options.password || !options.url || !options.baseDN) {
  		return console.log('All agruments of settings are required');
  	}else{
  		ad.create(options , function (err) {
  			if (err) {
  				return console.log('There is a error in creating settings, please verify if the activeDirectory database table exists');
  			}
  			console.log('Settings are successfully added');
  		});
  	}
  });

  program
  .command('getad')
  .description('Get Active Directory Settings')
  .action(function () {
  	ad.get(function (err , data) {
  		if (err) {
			return console.log('There is a error in fetching settings, please try again later');
		}
		if (data) {
			console.log('Here are active directory settings,');
			if (data.username) console.log('  - username : %s ', data.username);
			if (data.password) console.log('  - password : %s ', data.password);
			if (data.url) console.log('  - url : %s ', data.url);
			if (data.baseDN) console.log('  - baseDN : %s ', data.baseDN);
			return ;
		}else{
			console.log('No settings found');
		}
  	});
  });

  program
  .command('showadmin')
  .description('Show current users with admin privilege')
  .action(function () {
  	User.getAdminUsers(function (err , users) {
  		if (users && users.length) {
  			for (var i = 0; i < users.length; i++) {
  				console.log('%s %s (%s)', users[i].givenName, users[i].familyName, users[i].userId);
  			}
  		}else{
  			console.log('No admins found');
  		}
  	});
  });

  program
  .command('setadmin [userIds]')
  .description('Grant admin privileges to user(s)')
  .action(function (userIds) {
    if (userIds) {
      userIds = userIds.replace(/\s/g, '');
      userIds = userIds.split(',');
    }
    User.addAdminUsers(userIds, function (invalidUsers , adminUsers) {
      for (var i = 0; i < invalidUsers.length; i++) {
        console.log('%s is not found in the system', invalidUsers[i]);
      }
      for (i = 0; i < adminUsers.length; i++) {
        console.log('%s is successfully granted admin privileges', adminUsers[i]);
      }
    });
  });

  program
  .command('clearadmin [userId]')
  .description('Remove admin privileges from a user')
  .action(function (userId) {
    if (!userId) {
      return program.help();
    }
    User.removeAdmin(userId, function (msg) {
      console.log(msg);
    });
  });

  program.parse(process.argv);
  if(!program.args.length) {
  	program.help();
  }