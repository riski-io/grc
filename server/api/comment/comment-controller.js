const Controller = require('../../lib/controller');
const commentFacade  = require('./comment-facade');

var Governancerecord = require('../governancerecord/governancerecord-schema');
var Control = require('../control/control-schema');
var Review = require('../review/review-schema');
var ActionItem = require('../actionitem/actionitem-schema');

class CommentController extends Controller {

	getEmailRecipients (refEntityId, callback) {
	  var Model, recipients = [], entity ={};
	  if (refEntityId.indexOf('G-') > -1) {
	    Governancerecord.findById(refEntityId, function (err, record) {
	      if (err || !record) {
	        return callback(null);
	      }
	      if (record.nominatedReviewer) {
	        recipients.push(record.nominatedReviewer);
	      }
	      if (record.responsibleUser) {
	        recipients.push(record.responsibleUser);
	      }
	      entity = {
	        id : refEntityId,
	        title : record.title
	      };
	      callback(_.uniq(recipients), entity);
	    });
	  }else if (refEntityId.indexOf('R-') > -1) {
	    Review.findById(refEntityId, function (err, review) {
	      if (err || !review) {
	        return callback(null);
	      }
	      if (review.scheduledBy) {
	        recipients.push(review.scheduledBy);
	      }
	      if (review.participantList) {
	        recipients = _.uniq(_.union(recipients, review.participantList));
	      }
	      entity = {
	        id : refEntityId,
	        title : review.title
	      };
	      callback(recipients, entity);
	    });
	  }else if (refEntityId.indexOf('C-') > -1) {
	    Control.findById(refEntityId, function (err, control) {
	      if (err || !control) {
	        return callback(null);
	      }
	      if (control.responsibleUser) {
	        recipients.push(control.responsibleUser);
	      }
	      entity = {
	        id : refEntityId,
	        title : control.title
	      };
	      callback(recipients, entity);
	    });
	  }else{
	    ActionItem.findById(refEntityId, function (err, actionItem) {
	      if (err || !actionItem) {
	        return callback(null);
	      }
	      if (actionItem.assignedTo) {
	        recipients.push(actionItem.assignedTo);
	      }
	      if (actionItem.createdBy) {
	        recipients.push(actionItem.createdBy);
	      }
	      entity = {
	        id : refEntityId,
	        title : actionItem.title
	      };
	      callback(recipients, entity);
	    });
	  }

	}
}

module.exports = new CommentController(commentFacade);
