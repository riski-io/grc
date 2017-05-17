class Controller {
  constructor(facade) {
    this.facade = facade;
  }

  find(req, res, next) {
    return this.facade.find(req.query)
    .then(collection => res.status(200).json(collection))
    .catch(err => next(err));
  }

  findOne(req, res, next) {
    return this.facade.findOne(req.query)
    .then(doc => res.status(200).json(doc))
    .catch(err => next(err));
  }

  findById(req, res, next) {
    return this.facade.findById(req.params.id)
    .then(doc => {
      if (!doc) { return res.status(404).end(); }
      return res.status(200).json(doc);
    })
    .catch(err => next(err));
  }

  create(req, res, next) {
    var body = req.body;
    body = Object.assign(body, {
      createdBy : req.user.id || req.user._id,
      postedBy : req.user.id || req.user._id,
      responsibleUser : req.user.id || req.user._id
    });
    this.facade.create(body)
    .then(doc => res.status(201).json(doc))
    .catch(err => next(err));
  }

  update(req, res, next) {
    const conditions = { 
      _id: req.params.id
    };
    var body = req.body;
    body = Object.assign(body, {updatedBy : req.user.id || req.user._id});
    this.facade.update(conditions, body)
    .then(doc => {
      if (!doc) { return res.status(404).end(); }
      return res.status(200).json(doc);
    })
    .catch(err => next(err));
  }

  remove(req, res, next) {
    this.facade.remove(req.params.id)
    .then(doc => {
      if (!doc) { return res.status(404).end(); }
      return res.status(204).end();
    })
    .catch(err => next(err));
  }

}

module.exports = Controller;
