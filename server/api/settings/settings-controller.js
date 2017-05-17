const Controller = require('../../lib/controller');
const settingsFacade  = require('./settings-facade');

class SettingsController extends Controller {}

module.exports = new SettingsController(settingsFacade);
