const config = require('../../lib/config');

  let mapping = {
    "ID" :{"type": "keyword"},
    "TITLE" :{"type": "text"},
    "DESCRIPTION" : { "type": "text"},
    "STATUS" : {"type": "keyword"},
    "REVIEW_TYPE":{"type": "keyword"},
    "SCHEDULE_TYPE" : {"type": "keyword"},
    "RESPONSIBLE_USER_ID" : {"type": "keyword"},
    "RESPONSIBLE_USER_NAME" : {"type": "keyword"},
    "ORG_UNIT_ID" : {"type": "keyword"},
    "ORG_UNIT_NAME" : {"type": "keyword"},
    "CREATED_BY_USER_ID" : { "type": "keyword"},
    "CREATED_BY_USER_NAME" : {"type": "keyword"},
    "CREATED_AT":{"type": "date"},
    "UPDATED_AT":{"type": "date"},
    "PARENT_ORG_UNITS" : {"properties" : {"id": {"type": "keyword"},"name": {"type": "keyword"}}}
  };


  function transform (model, cb) {
    model.populate('responsibleOrg createdBy', function (err, doc) {
      if (err) {
        return cb(err);
      }
      doc = doc.toJSON({ virtuals: true });
      let transformed = {
        "ID" : doc.id,
        "TITLE" : doc.title,
        "STATUS" : doc.status,
        "DESCRIPTION" : doc.description,
        "REVIEW_TYPE":doc.reviewType,
        "SCHEDULE_TYPE": doc.scheduleType,
        "ORG_UNIT_ID" : doc.responsibleOrg.id,
        "ORG_UNIT_NAME" : doc.responsibleOrg.name,
        "CREATED_BY_USER_ID" : doc.createdBy.id,
        "CREATED_BY_USER_NAME" : doc.createdBy.display_name,
        "CREATED_AT": doc.createdAt,
        "UPDATED_AT": doc.updatedAt
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