var _ = require('lodash');

var enumItems = [{
    "key" : "user_role",
    "code" : "sys_admin",
    "title" : "System Admin"
},{
    "key" : "user_role",
    "code" : "account_admin",
    "title" : "Account Admin"
},{
    "key" : "user_role",
    "code" : "manager",
    "title" : "Manager"
},{
    "key" : "user_role",
    "code" : "member",
    "title" : "Member"
},{
    "key" : "action_status",
    "code" : "new",
    "title" : "New"
},{
    "key" : "action_status",
    "code" : "in-progress",
    "title" : "In Progress"
},{
    "key" : "action_status",
    "code" : "resolved",
    "title" : "Resolved"
},{
    "key" : "action_status",
    "code" : "closed",
    "title" : "Closed"
},{
    "key" : "action_status",
    "code" : "abandoned",
    "title" : "Abandoned"
},{
    "key" : "record_status",
    "code" : "identified",
    "title" : "Identified"
},{
    "key" : "record_status",
    "code" : "assessed",
    "title" : "Assessed"
},{
    "key" : "record_status",
    "code" : "controlled",
    "title" : "Controlled"
},{
    "key" : "record_status",
    "code" : "uncontrolled",
    "title" : "Uncontrolled"
},{
    "key" : "record_status",
    "code" : "suspended",
    "title" : "Suspended"
},{
    "key" : "review_status",
    "code" : "scheduled",
    "title" : "Scheduled"
},{
    "key" : "review_status",
    "code" : "new",
    "title" : "New"
},{
    "key" : "review_status",
    "code" : "in-progress",
    "title" : "In Progress"
},{
    "key" : "review_status",
    "code" : "completed",
    "title" : "Completed"
},{
    "key" : "review_status",
    "code" : "cancelled",
    "title" : "Cancelled"
},
{
    "key" : "control_status",
    "code" : "new",
    "title" : "New"
},
{
    "key" : "control_status",
    "code" : "active",
    "title" : "Active"
},
{
    "key" : "control_status",
    "code" : "effective",
    "title" : "Effective"
},
{
    "key" : "control_status",
    "code" : "ineffective",
    "title" : "Ineffective"
},
{
    "key" : "control_status",
    "code" : "retired",
    "title" : "Retired"
},
{
    "key": "review_schedule_type",
    "code": "ad-hoc",
    "title": "Ad-Hoc"
}, {
    "key": "review_schedule_type",
    "code": "monthly",
    "title": "Monthly"
}, {
    "key": "review_schedule_type",
    "code": "quarterly",
    "title": "Quarterly"
}, {
    "key": "review_schedule_type",
    "code": "biannual",
    "title": "Biannual"
}, {
    "key": "review_schedule_type",
    "code": "annual",
    "title": "Annual"
},
{
    "key" : "review_type",
    "code" : "risk",
    "title" : "Risk"
},
{
    "key" : "review_type",
    "code" : "insurance",
    "title" : "Insurance"
},
{
    "key" : "review_type",
    "code" : "internal-audit",
    "title" : "Internal Audit"
},
{
    "key" : "review_type",
    "code" : "external-audit",
    "title" : "External Audit"
},
{
    "key" : "review_type",
    "code" : "stewardship",
    "title" : "Stewardship"
},
{
    "key" : "review_type",
    "code" : "control-self-assessment",
    "title" : "Control Self Assessment"
},
{
    "key" : 'risk_likelihood',
    "code": "certain-to-occur",
    "title" : "Certain to occur",
    "description" : "expected to occur in most circumstances"
},
{
    "key" : 'risk_likelihood',
    "code": "very-likely",
    "title" : "Very likely",
    "description" : "will probably occur in most circumstances"
},
{
    "key" : 'risk_likelihood',
    "code": "possible",
    "title" : "Possible",
    "description" : "might occur occasionally."
},
{
    "key" : 'risk_likelihood',
    "code": "unlikely",
    "title" : "Unlikely",
    "description" : "could happen at some time"
},
{
    "key" : 'risk_likelihood',
    "code": "rare",
    "title" : "Rare",
    "description" : "may happen only in exceptional circumstances"
},
{
    "key": "control_effectiveness",
    "code": "effective",
    "title": "Effective",
    "description": "Controls are strong and operating effectively, providing a reasonable level of assurance that the mitigating objectives are being achieved."
}, {
    "key": "control_effectiveness",
    "code": "adequate",
    "title": "Adequate",
    "description": "Controls are sound and targeted, but cannot provide a reasonable level of assurance that the mitigating objectives are being achieved due to the inability to control some external forces."
}, {
    "key": "control_effectiveness",
    "code": "improvement-required",
    "title": "Improvement Required",
    "description": "Some control weaknesses/ inefficiencies have been identified.  Although these are not considered to present a serious risk exposure, improvements are required to provide a reasonable assurance that the mitigating objectives will be achieved."
}, {
    "key": "control_effectiveness",
    "code": "weak",
    "title": "Weak",
    "description": "Many weaknesses/inefficiencies exist, or an identified key weakness.  Controls do not provide reasonable assurance that the mitigating objectives will be achieved."
}, {
    "key": "control_effectiveness",
    "code": "uncontrollable",
    "title": "Uncontrollable",
    "description": "Cannot control."
}, {
    "key": "external_factors",
    "code": "stable",
    "title": "Stable",
    "description": "The external factors are well regulated and understood.  No significant change to the economic, political, market or regulatory forces on this issue is expected."
}, {
    "key": "external_factors",
    "code": "changeable",
    "title": "Changeable",
    "description": "There is a reasonable chance of significant change in the external factors, which may introduce a level of uncertainty with this risk issue."
}, {
    "key": "external_factors",
    "code": "volatile",
    "title": "Volatile",
    "description": "There is a high chance of significant change in the external factors, which will introduce a high level of uncertainty with this risk issue."
}, {
    "key": "risk_category",
    "code": "operational-health-and-safety",
    "description": "Harm caused by health and safety related hazards.",
    "title": "Operational - Health and Safety"
}, {
    "key": "risk_category",
    "code": "operational-environment",
    "description": "Impacts to Land, Air, Water, Waste, Noise, Energy and Greenhouse Gas (LAWWNE).",
    "title": "Operational - Environment"
}, {
    "key": "risk_category",
    "code": "operational-manufacture-and-supple",
    "description": "Impacts to operational Manufacture and supply chain continuity\n- Plant and equipment security\n- Manufacturing capability\n- Supplier interruption\n- Customer delivery interruption\n- Deliver production capacity plans",
    "title": "Operational - Manufacture and Supple"
}, {
    "key": "risk_category",
    "code": "market-demand",
    "description": "Impacts from the market environment\n- Economic climate and business cycles\n- Competitiveness and profitability\n- Changes in industry structure\n- End customer consumption trends\n- Deliver strategic growth plans",
    "title": "Market Demand"
}, {
    "key": "risk_category",
    "code": "reputation-compliance",
    "description": "Impacts from not meeting our obligations\n- Internal policies\n- Legislation and other regulations\n- Operating licences and codes\n- Contractual obligations\n- Representations and warranties\n- Product quality fit for purpose",
    "title": "Reputation - Compliance"
}, {
    "key": "risk_category",
    "code": "reputation-our-conduct",
    "description": "Impacts from not Living Our Bond\n- Brand (corporate and product)\n- Stakeholder relationships\n- Community standards and engagement\n- Culture and business conduct\n- Retain and develop our people",
    "title": "Reputation - Our Conduct"
}, {
    "key": "risk_category",
    "code": "reputation-external",
    "description": "Disruptive behaviour by external parties directly impacting our business or our  supply chain\n- Adverse public opinion\n- Sabotage and terrorism\n- Crime, including cyber-crime",
    "title": "Reputation - External"
}, {
    "key": "risk_category",
    "code": "financial",
    "description": "Impacts to financial results and cash not being available to fund objectives\n- Earnings and Operating cash flow\n- Debt and Equity funding",
    "title": "Financial"
}];

module.exports = {
    id: '1492179001786-add-enum-items',

    up : function(db, cb){
        db.collection('enumitems').insertMany(enumItems, cb);
    },

    down : function(db, cb){
        var keys = _.map(enumItems, 'key');
        db.collection('enumitems').deleteMany({key : {$in : keys}}, cb);
    }
}
