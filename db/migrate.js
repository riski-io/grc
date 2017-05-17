'use strict';

// Set default node environment to development
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var path = require('path');
var Migration = require('mongration').Migration;
var env = process.env.NODE_ENV || 'development';
var config = require(`./config/${env}`);
var config = {
	mongoUri : process.env.MONGO_URI || config.mongoUri,
	migrationCollection: 'migrations'
};

var migration = new Migration(config);

migration.addAllFromPath(path.join(__dirname, './migration-steps/'));

migration.migrate(function(err, results){
    console.log(results);
});