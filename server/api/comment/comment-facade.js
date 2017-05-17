const Model = require('../../lib/facade');
const commentSchema  = require('./comment-schema');

class CommentModel extends Model {}

module.exports = new CommentModel(commentSchema);
