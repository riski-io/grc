/**
* Express configuration
*/

'use strict';

import express from 'express';
import favicon from 'serve-favicon';
import morgan from 'morgan';
import compression from 'compression';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import path from 'path';
import config from './config';
import logger from './logger';
import expressWinston from 'express-winston';
import expressValidation from 'express-validation';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import routes from '../routes';
import {isAuthenticated} from '../auth/auth.service';

const app = express();
app.use(favicon(`${config.root}/favicon.ico`));

const env = app.get('env');
app.set('views', `${config.root}/server/views`);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false,limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(methodOverride());
app.use(cookieParser());
app.enable('trust proxy');
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use(express.static(`${config.root}/client`));
app.set('appPath', `${config.root}/client`);

if ('development' === env || 'test' === env) {
    app.use(require('connect-livereload')({
      ignore: [/\.js$/, /\.css$/, /\.svg$/, /\.ico$/, /\.woff$/, /\.png$/, /\.jpg$/, /\.jpeg$/, /\/api/i]
    }));
    app.use(express.static(`${config.root}/.tmp`));
    app.use(morgan('dev'));
    expressWinston.requestWhitelist.push('body');
}

/** GET /health-check - Check service health */
app.get('/health-check', (req, res) =>
  res.send('OK')
);

app.get('/build-version' , function (req , res) {
  res.json({
    RISKI_BUILD_ID : process.env.BUILD_ID || 1.0
  });
});

app.use('/api', isAuthenticated({secretKey : config.auth0.clientSecret}), routes);


// All other routes should redirect to the index.html

// if error is not an instanceOf APIError, convert it.
app.use((err, req, res, next) => {
  if (err instanceof expressValidation.ValidationError) {
    // validation error contains errors which is an array of error each containing message[]
    const unifiedErrorMessage = err.errors.map(error => error.messages.join('. ')).join(' and ');
    const error = new APIError(unifiedErrorMessage, err.status, true);
    return next(error);
  } else if (!(err instanceof APIError)) {
    const apiError = new APIError(err.message, err.status, err.isPublic);
    return next(apiError);
  }
  return next(err);
});

app.use('/:url(api|auth|components|app|bower_components|assets|fonts)/*', (req, res, next) => {
  const err = new APIError(`API not found - ${req.url}`, httpStatus.NOT_FOUND);
  return next(err);
});

// error handler, send stacktrace only during development
app.use((err, req, res, next) => {// eslint-disable-line no-unused-vars
    console.log(err);
    res.status(err.status).json({
      message: err.isPublic ? err.message : httpStatus[err.status],
      //stack: config.env === 'development' ? err.stack : {}
    });
  }
);

app.route('/*').get((req, res) => {
    res.sendFile('index.html', {
        root: app.get('appPath')
    });
});

export default app;

