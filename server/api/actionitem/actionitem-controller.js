const Controller = require('../../lib/controller');
const actionitemFacade  = require('./actionitem-facade');

class ActionitemController extends Controller {}

module.exports = new ActionitemController(actionitemFacade);
