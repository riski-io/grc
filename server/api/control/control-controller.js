const Controller = require('../../lib/controller');
const controlFacade  = require('./control-facade');

class ControlController extends Controller {}

module.exports = new ControlController(controlFacade);
