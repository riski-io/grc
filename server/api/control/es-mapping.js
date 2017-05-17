const config = require('../../lib/config');

let mapping = {
    "ID" :{"type": "keyword"},
    "TITLE" :{"type": "text"},
    "DESCRIPTION" : { "type": "text"},
    "STATUS" : {"type": "keyword"},
    "CATEGORY" : {"type": "keyword"},
    "CREATED_AT":{"type": "date"},
    "UPDATED_AT":{"type": "date"},
    "EFFECTIVE_FROM":{"type": "date"},
    "EFFECTIVE_TO":{"type": "date"},
    "ORG_UNIT_ID" : {"type": "keyword"},
    "ORG_UNIT_NAME" : {"type": "keyword"},
    "RESPONSIBLE_USER_ID" : { "type": "keyword"},
    "RESPONSIBLE_USER_NAME" : {"type": "keyword"},
    "CREATED_BY_USER_ID" : { "type": "keyword"},
    "CREATED_BY_USER_NAME" : {"type": "keyword"},
    "PARENT_ORG_UNITS" : {"properties" : {"id": { "type": "keyword"},"name": {"type": "keyword"}}}
  }


  function transform (model, cb) {
    model.populate('responsibleUser createdBy responsibleOrg', function (err, doc) {
      if (err) {
        return cb(err);
      }
      doc = doc.toJSON({virtuals : true});
      let transformed = {
        "ID" : doc.id,
        "TITLE" : doc.title,
        "STATUS" : doc.status,
        "CATEGORY" : doc.category,  
        "CREATED_AT": doc.createdAt,
        "UPDATED_AT": doc.updatedAt,
        "EFFECTIVE_FROM": doc.effectiveFrom,
        "EFFECTIVE_TO": doc.effectiveTo,
        "ORG_UNIT_ID" : doc.responsibleOrg._id,
        "ORG_UNIT_NAME" : doc.responsibleOrg.name,
        "RESPONSIBLE_USER_ID" : doc.responsibleUser.id,
        "RESPONSIBLE_USER_NAME" : doc.responsibleUser.name,
        "CREATED_BY_USER_ID" : doc.createdBy.id,
        "CREATED_BY_USER_NAME" : doc.createdBy.name,
        "DESCRIPTION" : doc.description
      };
      transformed["PARENT_ORG_UNITS"] = doc.responsibleOrg.ancestors || [];
      transformed["PARENT_ORG_UNITS"].push({
        id : doc.responsibleOrg.id,
        name : doc.responsibleOrg.orgName
      });
      return cb(null, transformed);
    });
  }

  module.exports = {
    mapping : mapping,
    transform : transform
  }