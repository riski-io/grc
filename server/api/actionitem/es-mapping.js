const config = require('../../lib/config');
let mapping = {
  "ID" :{ "type": "keyword"},
	"TITLE" :{ "type": "text"},
	"STATUS" : { "type": "keyword"},
	"CATEGORY" : { "type": "keyword"},	
	"REVIEW_TYPE" : { "type": "keyword"},
	"CREATED_AT":{"type": "date"},
	"UPDATED_AT":{"type": "date"},
	"DUE_DATE":{"type": "date"},
  "ORG_UNIT_ID" : { "type": "keyword"},
  "ORG_UNIT_NAME" : { "type": "keyword"},
  "ASSIGNED_USER_ID" : { "type": "keyword"},
  "ASSIGNED_USER_NAME" : { "type": "keyword"},
  "CREATED_BY_USER_ID" : { "type": "keyword"},
  "CREATED_BY_USER_NAME" : { "type": "keyword"},
  "PARENT_ORG_UNITS" : { "properties" : {"id": { "type": "keyword"},"name": {"type": "keyword" }}},
  "PRIORITY" : { "type": "keyword"},
  "DESCRIPTION" : { "type": "text"},
  "PERCENT_COMPLETE" : {"type" : "float"},
  "REF_ENTITY_TYPE" : { "type": "keyword"},
  "REF_ENTITY_ID" : { "type": "keyword"}
};

function transform (model, cb) {
  model.populate('assignedTo createdBy responsibleOrg', function (err, doc) {
    if (err) {
      return cb(err);
    }
    doc = doc.toJSON({virtuals : true});
    let transformed = {
      "ID" : doc.id,
      "TITLE" : doc.title,
      "STATUS" : doc.status,
      "CATEGORY" : doc.category,  
      "REVIEW_TYPE" : doc.reviewType,
      "CREATED_AT": doc.createdAt,
      "UPDATED_AT": doc.updatedAt,
      "DUE_DATE": doc.dueDate,
      "ORG_UNIT_ID" : doc.responsibleOrg.id,
      "ORG_UNIT_NAME" : doc.responsibleOrg.name,
      "ASSIGNED_USER_ID" : doc.assignedTo._d,
      "ASSIGNED_USER_NAME" : doc.assignedTo.name,
      "CREATED_BY_USER_ID" : doc.createdBy.id,
      "CREATED_BY_USER_NAME" : doc.createdBy.name,
      "PRIORITY" : doc.priority,
      "DESCRIPTION" : doc.description,
      "PERCENT_COMPLETE" : doc.percentComplete,
      "REF_ENTITY_TYPE" : doc.refEntityId,
      "REF_ENTITY_ID" : doc.refEntityType
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



