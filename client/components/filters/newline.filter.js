'use strict';

angular.module('grcApp').filter('nl2br', function() {
  return function(text) {
    return text.replace(/\n/g, '<br/>');
  };
});
