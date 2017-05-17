const config = require('../../lib/config');

  let mapping = {
    "ID" :{"type": "keyword"},
    "TITLE" :{"type": "text"},
    "DESCRIPTION" : { "type": "text"},
    "STATUS" : {"type": "keyword"},
    "CATEGORY" : {"type": "keyword"},
    "REVIEW_TYPE":{"type": "keyword"},
    "REVIEW_ID":{"type": "keyword"},
    "REVIEW_TITLE":{"type": "keyword"},
    "ORG_UNIT_ID" : {"type": "keyword"},
    "ORG_UNIT_NAME" : {"type": "keyword"},
    "RESPONSIBLE_USER_ID" : {"type": "keyword"},
    "RESPONSIBLE_USER_NAME" : {"type": "keyword"},
    "REVIEWER_USER_ID" : {"type": "keyword"},
    "REVIEWER_USER_NAME" : {"type": "keyword"},
    "CREATED_BY_USER_ID" : { "type": "keyword"},
    "CREATED_BY_USER_NAME" : {"type": "keyword"},
    "OVERALL_INITIAL_RATING":{"type": "keyword"},
    "OVERALL_INITIAL_COST":{"type": "keyword"},
    "OVERALL_INITIAL_CONSEQUENCE":{"type": "keyword"},
    "OVERALL_INITIAL_LIKELIHOOD":{"type": "keyword"},
    "OVERALL_CONTROLLED_RATING":{"type": "keyword"},
    "OVERALL_CONTROLLED_COST":{"type": "keyword"},
    "OVERALL_CONTROLLED_CONSEQUENCE":{"type": "keyword"},
    "OVERALL_CONTROLLED_LIKELIHOOD":{"type": "keyword"},
    "OVERALL_TARGET_RATING":{"type": "keyword"},
    "OVERALL_TARGET_COST":{"type": "keyword"},
    "OVERALL_TARGET_CONSEQUENCE":{"type": "keyword"},
    "OVERALL_TARGET_LIKELIHOOD":{"type": "keyword"},
    "CREATED_AT":{"type": "date"},
    "UPDATED_AT":{"type": "date"},
    "PARENT_ORG_UNITS" : {"properties" : {"id": {"type": "keyword"},"name": {"type": "keyword"}}}
  };


  function transform (model, cb) {
    model.populate('responsibleUser nominatedReviewer responsibleOrg identifiedAt createdBy', function (err, doc) {
        if (err) {
          return cb(err);
        }
        doc = doc.toJSON({virtuals : true});
      let transformed = {
        "ID" : doc.id,
        "TENANT_ID":doc.tenantId,
        "TITLE" : doc.title,
        "STATUS" : doc.status,
        "CATEGORY" : doc.category,
        "DESCRIPTION" : doc.description,
        "REVIEW_TYPE":doc.reviewType,
        "REVIEW_ID": doc.identifiedAt ? doc.identifiedAt.id : undefined,
        "REVIEW_TITLE":doc.identifiedAt ? doc.identifiedAt.title : undefined,
        "ORG_UNIT_ID" : doc.responsibleOrg.id,
        "ORG_UNIT_NAME" : doc.responsibleOrg.name,
        "RESPONSIBLE_USER_ID" : doc.responsibleUser.id,
        "RESPONSIBLE_USER_NAME" : doc.responsibleUser.name,
        "CREATED_BY_USER_ID" : doc.createdBy.id,
        "CREATED_BY_USER_NAME" : doc.createdBy.name,
        "REVIEWER_USER_ID" : doc.nominatedReviewer ? doc.nominatedReviewer.id :  undefined,
        "REVIEWER_USER_NAME" : doc.nominatedReviewer ? doc.nominatedReviewer.name : undefined,
        "OVERALL_INITIAL_RATING":doc.overallAssessment.initialRating,
        "OVERALL_INITIAL_COST":doc.overallAssessment.initialCost,
        "OVERALL_INITIAL_CONSEQUENCE":doc.overallAssessment.initialConsequence,
        "OVERALL_INITIAL_LIKELIHOOD":doc.overallAssessment.initialLikelihood,
        "OVERALL_CONTROLLED_RATING":doc.overallAssessment.controlledRating,
        "OVERALL_CONTROLLED_COST":doc.overallAssessment.controlledCost,
        "OVERALL_CONTROLLED_CONSEQUENCE":doc.overallAssessment.controlledConsequence,
        "OVERALL_CONTROLLED_LIKELIHOOD":doc.overallAssessment.controlledLikelihood,
        "OVERALL_TARGET_RATING":doc.overallAssessment.targetRating,
        "OVERALL_TARGET_COST":doc.overallAssessment.targetCost,
        "OVERALL_TARGET_CONSEQUENCE":doc.overallAssessment.targetConsequence,
        "OVERALL_TARGET_LIKELIHOOD":doc.overallAssessment.targetLikelihood,
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