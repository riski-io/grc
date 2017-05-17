const Model = require('../../lib/facade');
const reviewSchema  = require('./review-schema');

class ReviewModel extends Model {}

module.exports = new ReviewModel(reviewSchema);
