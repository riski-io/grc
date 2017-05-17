const Controller = require('../../lib/controller');
const reviewFacade  = require('./review-facade');

class ReviewController extends Controller {}

module.exports = new ReviewController(reviewFacade);
