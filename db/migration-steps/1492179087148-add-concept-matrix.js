var _ = require('lodash');

const matrix = [{
    "key": "risk_category",
    "code": "operational-health-and-safety",
    "rating": 1,
    "description": "Harm ranging from minor cuts, scratches, bruises up to and including First Aid Treatment."
}, {
    "key": "risk_category",
    "code": "operational-health-and-safety",
    "rating": 2,
    "description": "Harm ranging from injuries resulting in temporary impairment and short term recovery up to and including Medically Treated Injuries."
}, {
    "key": "risk_category",
    "code": "operational-health-and-safety",
    "rating": 3,
    "description": "Harm ranging from Lost Time Injuries up to and including health impacts and injuries requiring hospitalisation and/or ongoing medical treatment with possibility of some moderate permanent effects."
}, {
    "key": "risk_category",
    "code": "operational-health-and-safety",
    "rating": 4,
    "description": "Harm ranging from health impacts and injuries with serious permanent effects up to and including the fatal injury of 1 person."
}, {
    "key": "risk_category",
    "code": "operational-health-and-safety",
    "rating": 5,
    "description": "Harm ranging from the fatal injury of 2+ people."
}, {
    "key": "risk_category",
    "code": "operational-environment",
    "rating": 1,
    "description": "LAWWNE impact that is localised on-site and can be promptly addressed, with little or no effect off-site.. "
}, {
    "key": "risk_category",
    "code": "operational-environment",
    "rating": 2,
    "description": "LAWWNE impact that is localised on-site and can be addressed in the short term, with little (nuisance) effect off-site that can be promptly addressed."
}, {
    "key": "risk_category",
    "code": "operational-environment",
    "rating": 3,
    "description": "LAWWNE impact that is localised on-site and can be addressed in the medium term, with localised effect off-site that can be addressed in the short term."
}, {
    "key": "risk_category",
    "code": "operational-environment",
    "rating": 4,
    "description": "LAWWNE impact that is widespread on-site, requiring long-term remediation and leaving some residual damage on site, with localised effect off-site that can be addressed in the medium term."
}, {
    "key": "risk_category",
    "code": "operational-environment",
    "rating": 5,
    "description": "LAWWNE impact that is widespread on and off-site, requiring long term remediation and leaving major residual damage both on and off-site."
}, {
    "key": "risk_category",
    "code": "operational-manufacture-and-supple",
    "rating": 1,
    "description": "Easily addressed or rectified by immediate corrective action.  Minimal equipment damage, loss of production or impact on delivery performance."
}, {
    "key": "risk_category",
    "code": "operational-manufacture-and-supple",
    "rating": 2,
    "description": "Superficial damage to equipment.  Slight loss of production or impact on delivery performance."
}, {
    "key": "risk_category",
    "code": "operational-manufacture-and-supple",
    "rating": 3,
    "description": "Repairable form of damage to equipment. Loss of production or impact on delivery performance with some customer communication  required"
}, {
    "key": "risk_category",
    "code": "operational-manufacture-and-supple",
    "rating": 4,
    "description": "Damage to equipment, requiring considerable corrective or preventative action and loss of production or impact on delivery performance with some customers requiring alternative supply."
}, {
    "key": "risk_category",
    "code": "operational-manufacture-and-supple",
    "rating": 5,
    "description": "Damage to equipment or future operations at site severely affecting the operation, requiring urgent corrective action.  Large loss of production or impact on delivery performance with key customers lost to alternate supply."
}, {
    "key": "risk_category",
    "code": "market-demand",
    "rating": 1,
    "description": "Can be easily explained through normal activity.  Negligible impact to market demand or market share."
}, {
    "key": "risk_category",
    "code": "market-demand",
    "rating": 2,
    "description": "Consequences absorbed, but management effort is required to limit the impact. Small impact to market demand or market share."
}, {
    "key": "risk_category",
    "code": "market-demand",
    "rating": 3,
    "description": "Change in market environment which can be managed with effort. A slow down in some orders, customers seeking alternative supply in the short-term or market share loss in some sectors."
}, {
    "key": "risk_category",
    "code": "market-demand",
    "rating": 4,
    "description": "Considerable change in market environment with prioritised and focused management attention required.  A material slow down in orders, customers lost to alternative supply or material market share loss in some sectors."
}, {
    "key": "risk_category",
    "code": "market-demand",
    "rating": 5,
    "description": "A substantially large change in market environment suggesting structural change in a key market sector or [collapse] of part of business.  A substantial large slow down in orders, key customers lost to alternate supply or a material and sustained loss of market share."
}, {
    "key": "risk_category",
    "code": "reputation-compliance",
    "rating": 1,
    "description": "Technical or nominal breach which does not require reporting to regulator and is unlikely to lead to a regulatory response or is likely to be waived by any other affected party.  "
}, {
    "key": "risk_category",
    "code": "reputation-compliance",
    "rating": 2,
    "description": "Compliance breach but regulatory or effected party response is limited to a request for information, confirmation of corrective action, the issuing of a warning or small fee, penalty or fine."
}, {
    "key": "risk_category",
    "code": "reputation-compliance",
    "rating": 3,
    "description": "Compliance breach likely to result in investigation and prosecution by the regulator, with chance of a significant fine or restitution. Other affected parties may commence dispute resolution procedures short of commencing litigation.  "
}, {
    "key": "risk_category",
    "code": "reputation-compliance",
    "rating": 4,
    "description": "Compliance breach likely to result in investigation and prosecution with considerable chance of a substantial fine or restitution.  Other affected parties may commence civil proceedings resulting in award of damages against BlueScope.    "
}, {
    "key": "risk_category",
    "code": "reputation-compliance",
    "rating": 5,
    "description": "Compliance breach likely to result in investigation and prosecution resulting in a substantial large fine or restitution. Class action possible.  "
}, {
    "key": "risk_category",
    "code": "reputation-our-conduct",
    "rating": 1,
    "description": "No discernible impact. Negligible impact on local communities, internal culture or external relationships. "
}, {
    "key": "risk_category",
    "code": "reputation-our-conduct",
    "rating": 2,
    "description": "Individual complaints from some interested parties.  Short-term impact or localised impact on communities, organisational culture or external relationships."
}, {
    "key": "risk_category",
    "code": "reputation-our-conduct",
    "rating": 3,
    "description": "External attention and complaints with impact on organisational culture, local communities or external relationships.  Damage reparable in the medium term. "
}, {
    "key": "risk_category",
    "code": "reputation-our-conduct",
    "rating": 4,
    "description": "Adverse attention generated beyond local communities. Relationships with regulators or key stakeholders adversely affected. Ongoing impact on organisational culture or key external stakeholders. Permanent damage or noticeable impact on share price. "
}, {
    "key": "risk_category",
    "code": "reputation-our-conduct",
    "rating": 5,
    "description": "Adverse international attention or national attention in key locations. Ability to operate threatened. Substantial and irreparable or long term impact on organisational culture, key external stakeholders or material impact on share price. "
}, {
    "key": "risk_category",
    "code": "reputation-external",
    "rating": 1,
    "description": "No discernible impact. Negligible impact on business activities."
}, {
    "key": "risk_category",
    "code": "reputation-external",
    "rating": 2,
    "description": "Short-term impact or localised impact on business activities."
}, {
    "key": "risk_category",
    "code": "reputation-external",
    "rating": 3,
    "description": "External public attention in local communities.  Damage to business activities reparable in the medium term."
}, {
    "key": "risk_category",
    "code": "reputation-external",
    "rating": 4,
    "description": "Adverse public attention generated beyond local communities. Relationships with stakeholders adversely affected. Permanent damage or noticeable impact on share price. "
}, {
    "key": "risk_category",
    "code": "reputation-external",
    "rating": 5,
    "description": "Adverse international attention or national attention in key locations. Ability to operate threatened. Substantial and irreparable or long term impact on business activities or material impact on share price."
}, {
    "key": "risk_category",
    "code": "financial",
    "rating": 1,
    "description": " < A$1M"
}, {
    "key": "risk_category",
    "code": "financial",
    "rating": 2,
    "description": ">A$1M < A$10m"
}, {
    "key": "risk_category",
    "code": "financial",
    "rating": 3,
    "description": ">A$10M < A$50M  (assumptions required to support this value)"
}, {
    "key": "risk_category",
    "code": "financial",
    "rating": 4,
    "description": ">A$50M <A$100M  (assumptions required to support this value)"
}, {
    "key": "risk_category",
    "code": "financial",
    "rating": 5,
    "description": ">A$100M  (assumptions required to support this value)"
}];

module.exports = {
    id: '1492179087148-add-concept-matrix',

    up : function(db, cb){
        db.collection('conceptmatrixes').insertMany(matrix, cb);
    },

    down : function(db, cb){
        var keys = _.map(matrix, 'key');
        db.collection('conceptmatrixes').deleteMany({key : {$in : keys}}, cb);
    }
}