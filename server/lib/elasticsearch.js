import elasticsearch from 'elasticsearch';
import config from './config';
import Bluebird from 'bluebird';
import logger from './logger'
import moment from 'moment';


const elasticClient = new elasticsearch.Client({
  defer: function () {
    return Bluebird.defer();
  },
  host: [
    {
      host: config.es.host,
      auth: `${config.es.user}:${config.es.password}`,
      protocol: 'https',
      port : config.es.port
    }
  ]
});

elasticClient.ping({
  requestTimeout: Infinity
}, error => {
  if (error) {
    console.log(error);
    logger.error(new Error('Elasticsearch is down!'));
  } else {
    logger.info('Elasticsearch connection is setup');
  }
});

function getIndex(index) {
  const month = moment().format('YYYY-MM');
  return `${index}-${month}`;
}

module.exports = {
  client : elasticClient,
  getIndex: getIndex
}