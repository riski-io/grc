 "use strict";

import aqp from 'api-query-params';
const mongoose = require('mongoose');
const _ = require('lodash');

class Facade {
  constructor(Schema) {
    this.Schema = Schema;
  }

  create(input) {
    const schema = new this.Schema(input);
    return schema.save();
  }

  update(conditions, update) {
    return this.Schema.update(conditions, update, { new: true })
    .exec();
  }

  find(query = {}) {
    let attrs = Object.keys(this.Schema.schema.paths);
    let mongoquery = aqp(query);
    let limit = mongoquery.limit;
    let filter = _.cloneDeep(mongoquery.filter);
    let queryAttr = Object.keys(mongoquery.filter);
    let filterKeys = _.intersection(attrs, queryAttr);
    mongoquery.filter = {};
    _.forEach(filterKeys, function(key) {
      mongoquery.filter[key] = filter[key];
    });
    limit = limit? (limit > 500 ? 500 : limit) : 500;
    return this.Schema.find(mongoquery.filter)
          .skip(mongoquery.skip)
          .limit(limit) 
          .select(mongoquery.select)
          .sort(mongoquery.sort).exec();
  }

  findOne(query = {}) {
    let mongoquery = aqp(query);
    return this.Schema.findOne(mongoquery.filter)
          .select(mongoquery.select)
          .sort(mongoquery.sort).exec();
  }

  findById(id) {
    return this.Schema
    .findById(id)
    .exec();
  }

  remove(id) {
    return this.Schema
    .findByIdAndRemove(id)
    .exec();
  }
}

module.exports = Facade;

