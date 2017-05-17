'use strict';

const nodemailer = require('nodemailer');
const aws = require('aws-sdk');
const config = require('./config');

const transporter = nodemailer.createTransport({
    SES: new aws.SES({
        apiVersion: config.ses.apiVersion,
        region: 'us-east-1'
    })
});

exports.sendMail = function(mailOptions, callback) {
  transporter.sendMail({
      from: mailOptions.from || config.email.sender,
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html
  }, callback);
};
