const Controller = require('../../lib/controller');
const historyFacade  = require('./audithistory-facade');
const config = require('../../lib/config');
const _ = require('lodash');

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

function formatTextDiffString(value) {
  var lines = parseTextDiff(value);
  var result = '';
  result += '<ul style="list-style-type: none;">';
  for (var i = 0, l = lines.length; i < l; i++) {
    var line = lines[i];
    result += '<li>' +
      '<div style="color: #bbb; display: inline-block; min-width: 60px;">' +
      '<span>' + line.location.line + '</span>, <span>' + line.location.chr + '</span>' +
      '</div>' +
      '<div style="display: inline;">';
    var pieces = line.pieces;
    for (var pieceIndex = 0, piecesLength = pieces.length; pieceIndex < piecesLength; pieceIndex++) {
      var piece = pieces[pieceIndex];
      if (piece.type === 'added') {
        result += '<span style="background: none repeat scroll 0 0 #bbffbb;">' + piece.text + '</span>';
      } else if (piece.type === 'deleted') {
        result += '<span style="background: none repeat scroll 0 0 #ffbbbb; text-decoration: line-through;">' + piece.text + '</span>';
      } else {
        result += '<span>' + piece.text + '</span>';
      }
    }
    result += '</div></li>';
  }
  result += '</ul>';
  return result;
}

function parseTextDiff(value) {
  var output = [];
  var lines = value.split('\n@@ ');
  for (var i = 0, l = lines.length; i < l; i++) {
    var line = lines[i];
    var lineOutput = {
      pieces: []
    };
    var location = /^(?:@@ )?[-+]?(\d+),(\d+)/.exec(line).slice(1);
    lineOutput.location = {
      line: location[0],
      chr: location[1]
    };
    var pieces = line.split('\n').slice(1);
    for (var pieceIndex = 0, piecesLength = pieces.length; pieceIndex < piecesLength; pieceIndex++) {
      var piece = pieces[pieceIndex];
      if (!piece.length) {
        continue;
      }
      var pieceOutput = {
        type: 'context'
      };
      if (piece.substr(0, 1) === '+') {
        pieceOutput.type = 'added';
      } else if (piece.substr(0, 1) === '-') {
        pieceOutput.type = 'deleted';
      }
      pieceOutput.text = unescape(piece.slice(1));
      lineOutput.pieces.push(pieceOutput);
    }
    output.push(lineOutput);
  }
  return output;
}

class HistoryController extends Controller {

  getHistoryByEntity (req, res) {
    var refEntityId = req.params.refEntityId;

    historyFacade.find({refEntityId : refEntityId})
    .lean()
    .sort('createdAt').exec(function(err, list) {
      if (err){
        return res.status(404).send("Audit History does not exist");
      }
      var result = _.map(list, function(historyItem) {
        historyItem.changes = format(historyItem.snapshot, _.extend({}, historyItem.changeList));
        delete historyItem.snapshot;
        delete historyItem.changeList;
        return historyItem;
      });
      res.json(result);
    });
  };

	format(left, delta, parentDeltaType) {
	  _.each(_.keys(delta), function(key) {
	    if (key === '_t') {
	      delete delta[key];
	      return;
	    }
	    var deltaItem = delta[key];
	    var leftItem = {};
	    if (key[0] !== '_') {
	      leftItem = left[key] || {};
	    }
	    try {
	      if (parentDeltaType) {
	        if (parentDeltaType === 'deleted') {
	          if (_.isString(deltaItem) || _.isNumber(deltaItem)) {
	            delta[key] = '<span style="text-decoration: line-through; color: red;">' + deltaItem + '</span>';
	          } else if (_.isObject(deltaItem)) {
	            delta[key] = format(leftItem, deltaItem, parentDeltaType);
	          }
	        } else if (parentDeltaType === 'added') {
	          if (_.isString(deltaItem) || _.isNumber(deltaItem)) {
	            delta[key] = '<span style="color: green">' + deltaItem + '</span>';
	          } else if (_.isObject(deltaItem)) {
	            delta[key] = format(leftItem, deltaItem, parentDeltaType);
	          }
	        }
	      } else {
	        var deltaType = getDeltaType(deltaItem);
	        if (deltaType === 'node') {
	          delta[key] = _.extend({}, leftItem, format(leftItem, deltaItem));
	        } else if (deltaType === 'modified' && (_.isString(deltaItem[0]) || _.isNumber(deltaItem[0]))) {
	          delta[key] = '<span style="text-decoration: line-through; color: red">' + deltaItem[0] + '</span> <span style="color: green">' + deltaItem[1] + '</span>';
	        } else if (deltaType === 'deleted') {
	          if (_.isString(deltaItem[0]) || _.isNumber(deltaItem[0])) {
	            delta[key] = '<span style="text-decoration: line-through; color: red">' + deltaItem[0] + '</span>';
	          } else if (_.isObject(deltaItem[0])) {
	            delta[key] = format(leftItem, deltaItem[0], deltaType);
	          }
	        } else if (deltaType === 'added') {
	          if (_.isString(deltaItem[0]) || _.isNumber(deltaItem[0])) {
	            delta[key] = '<span style="color: green">' + deltaItem[0] + '</span>';
	          } else if (_.isObject(deltaItem[0])) {
	            delta[key] = format(leftItem, deltaItem[0], deltaType);
	          }
	        } else if (deltaType === 'textdiff') {
	          delta[key] = formatTextDiffString(deltaItem[0]);
	        }
	      }
	    } catch (e) {
	      console.log('audit-history controller:', e);
	    }
	  });
	  return delta;
	}
}

module.exports = new HistoryController(historyFacade);
