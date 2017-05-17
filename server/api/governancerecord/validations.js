import Joi from 'joi';
Joi.objectId = require('joi-objectid')(Joi);

export default {
  create: {
    body: {
      title: Joi.string().required(),
      status: Joi.string().required(),
      category: Joi.string().required(),
      description : Joi.string().required(),
      responsibleOrg : Joi.objectId(),
      responsibleUser : Joi.string().required()
    }
  },

  update: {
    body: {
      title: Joi.string().required(),
      status: Joi.string().required(),
      category: Joi.string().required(),
      description : Joi.string().required(),
      responsibleOrg : Joi.objectId(),
      responsibleUser : Joi.string().required()
    },
    params: {
      id: Joi.string().hex().required()
    }
  }
};