'use strict';

angular.module('grcApp')
  .config(function(lockProvider, jwtOptionsProvider, $stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, httpRequestInterceptorCacheBusterProvider) {
    $urlRouterProvider.otherwise('/home/app');

    lockProvider.init({
      clientID: 'S107RCFGpPSEatrLNIt6tjs2bUKe8QOu',
      domain: 'mygrc.au.auth0.com',
      options: {
        languageDictionary: {
            title: "Log in"
        },
        _idTokenVerification: false,
        container : 'login-container',
        loginAfterSignUp : false,
        additionalSignUpFields : [{
            name :  'display_name',
            placeholder : 'your full name',
            icon : 'assets/images/person.svg',
            validator : function(name) {
                return {
                    valid : name && name.length >= 1,
                    hint :  "Name is required"
                }
            }
        },{
            name : 'company',
            icon : 'assets/images/book.svg',
            placeholder : 'your company name',
            validator : function(name) {
                return {
                    valid : name && name.length >= 1,
                    hint :  "Company name is required"
                }
            }
        }],
        auth : {
            params : {
                scope : "openid email app_metadata",
                state: location.pathname            
            }
        },
        allowSignUp: true,
        theme: {
            logo: 'assets/images/logo.png',
            primaryColor: '#1ab394'
        }
      }
    });
    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('jwtInterceptor');
    $httpProvider.interceptors.push('authInterceptor');
    // Configuration for angular-jwt
    jwtOptionsProvider.config({
      tokenGetter: ['options', function(options) {
        if (options && options.url.substr(options.url.length - 5) == '.html') {
          return null;
        }
        return localStorage.getItem('id_token');
      }],
      whiteListedDomains: ['localhost'],
      unauthenticatedRedirector: ['$state', function($state) {
        $state.go('login');
      }]
    });
    httpRequestInterceptorCacheBusterProvider.setMatchlist([/.*api.*/], true);
  });