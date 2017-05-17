var _ = require('lodash');

var enums = [{ 
    "title" : "Risk Likelihood", 
    "key" : "risk_likelihood"
},{ 
    "title" : "Action Status", 
    "key" : "action_status"
},{ 
    "title" : "Control Status", 
    "key" : "control_status"
},{ 
    "title" : "Review Status", 
    "key" : "review_status"
},{
    "title" : "Record Status",
    "key" : "record_status"
},{ 
    "title" : "Control Effectiveness", 
    "key" : "control_effectiveness"
},{ 
    "title" : "Risk Category", 
    "key" : "risk_category"
},{ 
    "title" : "External Factors Trend", 
    "key" : "external_factors"
},{ 
    "title" : "Review Type", 
    "key" : "review_type"
},{ 
    "title" : "Review Schedule Type", 
    "key" : "review_schedule_type"
},{ 
    "title" : "Consequence - financial thresholds",
    "key" : "consequence"
},{ 
    "title" : "User Roles",
    "key" : "user_role"
}];

module.exports = {
    id: '1492178486975-add-enums',

    up : function(db, cb){
        db.collection('enums').insertMany(enums, cb);
    },

    down : function(db, cb){
        var keys = _.map(enums, 'key');
        db.collection('enums').deleteMany({key : {$in : keys}}, cb);
    }
}
