'use strict';

import compose from 'composable-middleware';
import User from '../api/user/user.model';
import Permission from '../api/permission/permission-schema';
import config from '../lib/config';
import jwt from 'express-jwt';
import auth0 from 'auth0';
import request from 'request';
import Promise from 'bluebird';
const _ = require('lodash');


export function getAuth0Client() {
  const AuthenticationClient = auth0.AuthenticationClient;

  let api = new AuthenticationClient({
    domain: config.auth0.domain,
    clientId: config.auth0.clientID
  });
  return api
}

export function getAuth0ManagementClient() {
  const ManagementClient = auth0.ManagementClient;
  const options = { 
    method: 'POST',
    url: `https://${config.auth0API.domain}/oauth/token`,
    headers: { 'content-type': 'application/json' },
    body: { grant_type: 'client_credentials',
       client_id: config.auth0API.clientID,
       client_secret: config.auth0API.clientSecret,
       audience: config.auth0API.audience },
    json: true 
  };

  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) return reject(error);
      let auth0 = new ManagementClient({
        domain: config.auth0API.domain,
        token: body.access_token
      });
      return resolve(auth0);
    });
  })
}

function registerUser(req, res, next) {
  User.findOne({email : req.user.email}).exec()
  .then(user => {
    let app_metadata = req.user.app_metadata;
    if(!user) {
      let AuthAPI = getAuth0Client();
      AuthAPI.getProfile(req.access_token, function (err, profile) {
        if(err) {
          return next(err);
        }
        try{
          profile = JSON.parse(profile);
        }catch(err){
          return next(err);
        }

        let userMap = {
          display_name : profile.user_metadata.display_name,
          email : profile.email,
        };

        let userModel = new User(userMap);
        userModel.save(function(err) {
          if (err) {
            return next(err);
          }
          userModel = JSON.parse(JSON.stringify(userModel));
          userModel.id = userModel.userId = userModel._id;
          req.user = userModel; 
          next();
          return null;
        });
      });
    }else{
      user = JSON.parse(JSON.stringify(user));
      user.id = user._id;
      user.userId = user._id;
      req.user = user; 
      next();
      return null;
    }
  })
  .catch(err => next(err));
}
    
/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
export function isAuthenticated() {

  if (!config.auth0.clientSecret) {
      throw new Error("secretKey must be supplied");
  }

  const data = {
      secretKey     : config.auth0.clientSecret,
      algorithms    : ['RS256','HS256']
  };

  const validateJwt = jwt({
      algorithms    : data.algorithms,
      secret        : data.secretKey
  });

  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      if(req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = `Bearer ${req.query.access_token}`;
      }
     // IE11 forgets to set Authorization header sometimes. Pull from cookie instead.
      if(req.query && typeof req.headers.authorization === 'undefined') {
        req.headers.authorization = `Bearer ${req.cookies.token}`;
      }
      req.access_token = req.headers.access_token;
      validateJwt(req, res, next);
    })
    // Attach user to request
    .use(registerUser);
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
export function hasRole(roleRequired) {
  if(!roleRequired) {
    throw new Error('Required role needs to be set');
  }

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if(config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
        return next();
      } else {
        return res.status(403).send('Forbidden');
      }
    });
}

/**
 * Returns a jwt token signed by the app secret
 */
export function signToken(id, role) {
  return jwt.sign({ _id: id, role }, config.secrets.session, {
    expiresIn: 60 * 60 * 5
  });
}


/**
 * Checks if the user role meets the minimum requirements of the route
 */
export function isAdmin() {
  return hasRole('admin');
}

/**
 * Set token cookie directly for oAuth strategies
 */
export function setTokenCookie(req, res) {
  if (!req.user) {
    return res.status(404).send('It looks like you aren\'t logged in, please try again.');
  }
  var token = signToken(req.user._id, req.user.role);
  res.cookie('token', token);
  res.redirect('/');
}


/**
 * check if the is permitted to do the action
 * Otherwise returns 403
 */
export function isPermitted (req, res, next) {
  var key = '' , 
  method,
  role = req.user.role;
  if (req.originalUrl.indexOf('/api/controls') > -1) {
    key = 'control';
  }else if (req.originalUrl.indexOf('/api/reviews') > -1){
    key = 'review';
  }else if (req.originalUrl.indexOf('/api/action-items') > -1){
    key = 'action_item';
  }else if (req.originalUrl.indexOf('/api/governance-records') > -1){
    key = 'gov_record';
  }else{
    return next();
  }

  if (req.method === 'POST' && req.originalUrl.indexOf('filter') > -1) {
    method = 'view';
  }else{
    switch(req.method){
      case 'GET' : method = 'view';break;
      case 'POST' : method = 'create';break;
      case 'PUT' : method = 'edit';break;
      case 'DELETE' : method = 'delete';break;
    }    
  }

  if (!method) return next();
  Permission.findOne({key: key}, function(err, data) {
    if (err) {
     return res.send(403);
    }
    if (data && data.roles && data.roles[role] && !data.roles[role][method]) {
      return res.send(403);
    }
    next();
  });
}
