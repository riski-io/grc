'use strict';

angular.module('grcApp').filter('range', function() {
  return function(input, min, max) {
    min = parseInt(min); //Make string input int
    if (!max) {
      max = min;
      min = 0;
    } else {
      max = parseInt(max);
    }
    for (var i = min; i < max; i++) {
      input.push(i.toString());
    }
    return input;
  };
});
