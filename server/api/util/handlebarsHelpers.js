'use strict';
var moment = require('moment');
var _ = require('lodash');

var DateFormats = {
  short: 'DD MMM YYYY',
  long: 'dddd DD.MM.YYYY HH:mm'
};


module.exports = function(handlebars) {

  handlebars.registerHelper('formatDate', function(datetime, format) {
    if (moment) {
      // can use other formats like 'lll' too
      format = DateFormats[format] || format;
      return moment(datetime).format(format);
    }
    else {
      return datetime;
    }
  });

  handlebars.registerHelper('math', function(lvalue, operator, rvalue, options) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);

    return {
      '+': lvalue + rvalue,
      '-': lvalue - rvalue,
      '*': lvalue * rvalue,
      '/': lvalue / rvalue,
      '%': lvalue % rvalue
    }[operator];
  });

  handlebars.registerHelper('getText', function(node, defaultText) {
    return getTextForNode(node, defaultText);
  });

  handlebars.registerHelper('formatCurrency', function(value) {
      return '$ ' + value +'M';
  });
  
  handlebars.registerHelper('if_eq', function(a, b, opts) {
      if(a === b)
          return opts.fn(this);
      else
          return opts.inverse(this);
  });

  handlebars.registerHelper('ratingstyle', function(val) {
    var cls = '';
    if ( +val >= 8 ) {
        cls ='rating-red';
    }
    if ( +val >= 6 && +val < 8) {
      cls = 'rating-orange';
    }
    if ( +val >= 4 && +val < 6) {
      cls = 'rating-yellow';
    }
    if ( +val >= 2 && +val < 4 ) {
      cls = 'rating-green';
    }
    var result = '<td class="text-center ' + cls + '">' + val + '</td>';
    return new handlebars.SafeString(result);
  });

  handlebars.registerHelper("inc", function(value, options){
      return parseInt(value) + 1;
  });

  handlebars.registerHelper('ratingstyleInput', function(val) {
    var cls = '';
    if ( +val >= 8 ) {
        cls ='rating-red';
    }
    if ( +val >= 6 && +val < 8) {
      cls = 'rating-orange';
    }
    if ( +val >= 4 && +val < 6) {
      cls = 'rating-yellow';
    }
    if ( +val >= 2 && +val < 4 ) {
      cls = 'rating-green';
    }
    var result = '<input type="text" class="form-control ' + cls + '" value ="'+val+'"disabled >';
    return new handlebars.SafeString(result);
  });
  
};
function getTextForNode(node, defaultText) {
  var nodeType = getDeltaType(node);

  if (nodeType === 'unknown') {
    return defaultText + 'default';
  }
  var text = '';
  switch (nodeType) {
    case 'added':
      text = node[0] + ' - new';
      break;
    case 'modified':
      text = '<span style="text-decoration: line-through">' + node[0] + '</span> ' + node[1];
      break;
    case 'deleted':
      text = node[0] + ' - removed';
      break;
    default:
      text = 'some';
  }
  return text;

}

function getDeltaType(delta, movedFrom) {
  if (typeof delta === 'undefined') {
    if (typeof movedFrom !== 'undefined') {
      return 'movedestination';
    }
    return 'unchanged';
  }
  if (_.isArray(delta)) {
    if (delta.length === 1) {
      return 'added';
    }
    if (delta.length === 2) {
      return 'modified';
    }
    if (delta.length === 3 && delta[2] === 0) {
      return 'deleted';
    }
    if (delta.length === 3 && delta[2] === 2) {
      return 'textdiff';
    }
    if (delta.length === 3 && delta[2] === 3) {
      return 'moved';
    }
  } else if (typeof delta === 'object') {
    return 'node';
  }
  return 'unknown';
}
