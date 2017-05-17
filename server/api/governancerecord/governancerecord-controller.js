const Controller = require('../../lib/controller');
const governancerecordFacade = require('./governancerecord-facade');

class GovernancerecordController extends Controller {

    getOverallAssessment(assessments) {
        var overallAssessment = {
            initialRating: 0,
            initialCost: 0,
            initialConsequence: 0,
            initialLikelihood: 0,
            controlledConsequence: 0,
            controlledLikelihood: 0,
            controlledRating: 0,
            controlledCost: 0,
            targetLikelihood: 0,
            targetConsequence: 0,
            targetRating: 0,
            targetCost: 0
        };
        var currentList = [];
        var currentListCost = [];
        var maxInitialRating = _.max(assessments, function(assessment) {
            if (assessment.initialAssessment) {
                return assessment.initialAssessment.rating;
            } else {
                return;
            }
        });
        var maxInitialCost = _.max(assessments, function(assessment) {
            if (assessment.initialAssessment) {
                return assessment.initialAssessment.cost;
            } else {
                return;
            }
        });
        if (maxInitialRating && maxInitialRating.initialAssessment) {
            var arr = _.filter(assessments, function(obj) {
                return obj.initialAssessment.rating === maxInitialRating.initialAssessment.rating;
            });
            if (arr && arr.length > 1) {
                maxInitialRating = _.max(arr, function(assessment) {
                    return assessment.initialAssessment.likelihood;
                });
            }
            overallAssessment.initialRating = Number(maxInitialRating.initialAssessment.rating);
            overallAssessment.initialConsequence = Number(maxInitialRating.initialAssessment.consequence);
            overallAssessment.initialLikelihood = Number(maxInitialRating.initialAssessment.likelihood);
            overallAssessment.initialCost = Number(maxInitialCost.initialAssessment.cost);
        }
        var maxTargetRating = _.max(assessments, function(assessment) {
            if (assessment.controlledAssessment) {
                return assessment.controlledAssessment.rating;
            } else {
                return;
            }
        });
        var maxTargetCost = _.max(assessments, function(assessment) {
            if (assessment.initialAssessment) {
                return assessment.controlledAssessment.cost;
            } else {
                return;
            }
        });
        if (maxTargetRating && maxTargetRating.controlledAssessment) {
            var arrTarget = _.filter(assessments, function(obj) {
                return obj.controlledAssessment.rating === maxTargetRating.controlledAssessment.rating;
            });
            if (arrTarget && arrTarget.length > 1) {
                maxTargetRating = _.max(arrTarget, function(assessment) {
                    return assessment.controlledAssessment.likelihood;
                });
            }
            overallAssessment.targetRating = maxTargetRating.controlledAssessment.rating;
            overallAssessment.targetConsequence = maxTargetRating.controlledAssessment.consequence;
            overallAssessment.targetLikelihood = maxTargetRating.controlledAssessment.likelihood;
            overallAssessment.targetCost = maxTargetCost.controlledAssessment.cost;
        }
        _.forEach(assessments, function(assessment) {
            if (_.some(assessment.controls, {
                    effectiveness: 'Effective'
                }) || _.some(assessment.controls, {
                    effectiveness: 'Adequate'
                })) {
                currentList.push({
                    controlledRating: assessment.controlledAssessment.rating,
                    controlledConsequence: assessment.controlledAssessment.consequence,
                    controlledLikelihood: assessment.controlledAssessment.likelihood
                });
                currentListCost.push(Number(assessment.controlledAssessment.cost));
            } else {
                currentList.push({
                    controlledRating: assessment.initialAssessment.rating,
                    controlledConsequence: assessment.initialAssessment.consequence,
                    controlledLikelihood: assessment.initialAssessment.likelihood
                });
                currentListCost.push(Number(assessment.initialAssessment.cost));
            }
        });
        var maxCurrentCost = _.max(currentListCost);
        var maxCurrentRating = _.max(currentList, function(obj) {
            return obj.controlledRating;
        });

        overallAssessment.controlledRating = maxCurrentRating.controlledRating;
        overallAssessment.controlledConsequence = maxCurrentRating.controlledConsequence;
        overallAssessment.controlledLikelihood = maxCurrentRating.controlledLikelihood;
        overallAssessment.controlledCost = maxCurrentCost;
        return overallAssessment;
    }
}

module.exports = new GovernancerecordController(governancerecordFacade);