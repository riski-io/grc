'use strict';

import config from '../lib/config';
import compose from 'composable-middleware';
import User from '../api/user/user.model';
import OrgUnit from '../api/organisation-unit/org-unit.model';
import OrgUnitController from '../api/organisation-unit/org-unit.controller';
import _ from 'lodash';

/**
 * check if the user has access to the data
 * Otherwise returns 403
 */
export function hasAccess(user, orgUnitId, callback) {
	if (user.role === "admin" ) return callback(true);
	if (_.isObject(orgUnitId)) {
		orgUnitId = orgUnitId.orgUnitId;
	}
	OrgUnitController.getOrgMemberships(user.userId , user.role, (err, orgs) => {
		if (_.some(orgs, { 'orgUnitId': orgUnitId})) {
			callback(true);
		}else{
			callback(false);
		}
	});
}