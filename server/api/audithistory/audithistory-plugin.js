import History from "./audithistory-schema";
import async from "async";

const jsondiffpatch = require("jsondiffpatch").create({
    objectHash: (obj) => obj._id || obj.id ,
    propertyFilter : (name, context) => {
        return ['updatedAt', 'createdAt', 'changedBy', 'createdBy', 'updatedBy', 'version'].indexOf(name) === -1;
    }
});

const saveHistoryObject = (history, callback) => {
    history.save(err => {
        if (err) {
            err.message = `Mongo Error :${err.message}`;
        }
        callback();
    });
};

const saveDiffObject = (currentObject, original, updated, user, reason, callback) => {
    const diff = jsondiffpatch.diff(JSON.parse(JSON.stringify(original)),
        JSON.parse(JSON.stringify(updated)));
    if (diff) {
        History.findOne({refEntityType: currentObject.constructor.modelName, refEntityId: currentObject._id}).sort("-version").exec((err, lastHistory) => {
            if (err) {
                err.message = `Mongo Error :${err.message}`;
                return callback();
            }
            const history = new History({
                refEntityType: currentObject.constructor.modelName,
                refEntityId: currentObject._id,
                changeList: diff,
                changedBy: user,
                reason,
                snapshot : original,
                version: lastHistory ? lastHistory.version + 1 : 0
            });
            saveHistoryObject(history, callback);
        });
    }
    else{
        callback();
    }
};

const saveDiffHistory = (queryObject, currentObject, callback) => {
    currentObject.constructor.findOne({_id: currentObject._id}, (err, selfObject) => {
        if(selfObject){
            const dbObject = {};
            let updateParams;
            updateParams = queryObject._update["$set"] ? queryObject._update["$set"] : queryObject._update;
            Object.keys(updateParams).forEach(key => {
                dbObject[key] = selfObject[key];
            });
            saveDiffObject(currentObject, dbObject, updateParams, queryObject.options.__user, queryObject.options.__reason, () => {
                callback();
            });
        }
    });
};

const saveDiffs = (self, next) => {
    const queryObject = self;
    queryObject.find(queryObject._conditions, (err, results) => {
        if (err) {
            err.message = `Mongo Error :${err.message}`;
            return next();
        }
        async.eachSeries(results, (result, callback) => {
            if (err) {
                err.message = `Mongo Error :${err.message}`;
                return next();
            }
            saveDiffHistory(queryObject, result, callback);
        }, function done() {
            return next();
        });
    });
};

const getVersion = (model, id, version, callback) => {
    model.findOne({_id: id}, (err, latest) => {
        if (err) {
            console.error(err);
            return callback(err, null);
        }
        History.find({refEntityType: model.modelName, refEntityId: id, version: {$gte : parseInt(version, 10)}},
            {diff: 1, version: 1}, {sort: "-version"}, (err, histories) => {
                if (err) {
                    console.error(err);
                    return callback(err, null);
                }
                const object = latest ? latest : {};
                async.each(histories, (history, eachCallback) => {
                    jsondiffpatch.unpatch(object, history.diff);
                    eachCallback();
                }, err => {
                    if (err) {
                        console.error(err);
                        return callback(err, null);
                    }
                    callback(null, object);
                });
            })
    });
};

const getHistories = (modelName, id, expandableFields, callback) => {
    History.find({refEntityType: modelName, refEntityId: id}, (err, histories) => {
        if (err) {
            console.error(err);
            return callback(err, null);
        }
        async.map(histories, (history, mapCallback) => {
            const changedValues = [];
            const changedFields = [];
            for (const key in history.changeList) {
                if (history.changeList.hasOwnProperty(key)) {

                    if (expandableFields.includes(key)) {
                        const oldValue = history.changeList[key][0];
                        const newValue = history.changeList[key][1];
                        changedValues.push(`${key} from ${oldValue} to ${newValue}`);
                    }
                    else {
                        changedFields.push(key);
                    }
                }
            }
            const comment = `modified ${changedFields.concat(changedValues).join(", ")}`;
            return mapCallback(null, {
                changedBy: history.changedBy,
                changedAt: history.createdAt,
                updatedAt: history.updatedAt,
                reason: history.reason,
                comment
            })
        }, (err, output) => {
            if (err) {
                console.error(err);
                return callback(err, null);
            }
            return callback(null, output);
        });
    });
};

const plugin = function lastModifiedPlugin(schema, options) {

    schema.pre("save", function (next) {
        const self = this;
        if(self.isNew) {
            next();
        }else{
            self.constructor.findOne({_id: self._id}, (err, original) => {
                saveDiffObject(self, original, self, self.__user, self.__reason, () => {
                    next();
                });
            });
        }
    });

    schema.pre("findOneAndUpdate", function (next) {
        saveDiffs(this, () => {
            next();
        });
    });

    schema.pre("update", function (next) {
        saveDiffs(this, () => {
            next();
        });
    });

    schema.pre("remove", function(next) {
        saveDiffObject(this, this, {}, this.__user, this.__reason, () => {
            next();
        })
    });
};

module.exports.plugin = plugin;
module.exports.getHistories = getHistories;
module.exports.getVersion = getVersion;