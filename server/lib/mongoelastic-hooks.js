const nop = function nop () {}
import elasticsearch from "./elasticsearch";
import seqqueue from 'seq-queue';
const client = elasticsearch.client;
const queue = seqqueue.createQueue(1000);

function createMappingIfNotPresent (options, cb) {
  let index = options.index
  let type = options.type
  let properties = options.properties

  const completeMapping = {};
  completeMapping[type] = {};
  completeMapping[type].properties = properties;

  client.indices.exists({
    index: index
  }, (err, exists) => {
    if (err) {
      return cb(err)
    }

    if (exists) {
      return client.indices.putMapping({
        index: index,
        type: type,
        body: completeMapping
      }, cb)
    }
    return client.indices.create({
      index: index
    }, indexErr => {
      if (indexErr) {
        return cb(indexErr)
      }

      client.indices.putMapping({
        index: index,
        type: type,
        body: completeMapping
      }, cb)
    })
  })
}

function deleteByMongoId (options, cb) {
  const type = options.type
  const client = options.client
  const model = options.model
  const index = elasticsearch.getIndex(options.index)
  let tries = options.tries

  client.delete({
    index: index,
    type: type,
    id: model._id.toString()
  }, (err, res) => {
    if (err && err.status === 404) {
      if (tries <= 0) {
        model.emit('es-removed', err, res)
        return cb(err)
      }
      options.tries = --tries
      setTimeout(() => {
        deleteByMongoId(options, cb)
      }, 500)
    } else {
      model.emit('es-removed', err, res)
      cb(err)
    }
  })
}

function postSave (opts) {
  let serialModel;
  return (doc) => {
    function onIndex (err, res) {
      doc.emit('es-indexed', err, res)
    }
    /**
     * Serialize the model, and apply transformation
     */
    opts.transform(doc, (err, serialModel) => {
      const index = elasticsearch.getIndex(opts.index);
      client.index({
        index: index,
        type: opts.type,
        id: serialModel.ID,
        body: serialModel
      }, onIndex);
    })
  }
}


function postRemove (opts) {
  return (doc) => {
    let options = {
      index: opts.index,
      type: opts.type,
      tries: 3,
      model: doc,
      client: client
    }
    deleteByMongoId(opts, nop)
  }
}

function addtoHooksQueue (...args) {
  queue.push(function(task) {
    setTimeout(function() {
      setUpMongoMiddlewareHooks(...args, function() {
        task.done();
      });
    },500)
  })
}

function setUpMongoMiddlewareHooks (schema, index, type, properties, transform, callback) {
  let opts = {
    index,
    type,
    properties,
    transform
  };

  createMappingIfNotPresent(opts, (err, res) => {
    schema.post('remove', postRemove(opts))
    schema.post('findOneAndRemove', postRemove(opts))
    schema.post('save', postSave(opts))
    schema.post('findOneAndUpdate', postSave(opts))
    callback();
  });
}

module.exports = {
  setUpMongoMiddlewareHooks : addtoHooksQueue
}
