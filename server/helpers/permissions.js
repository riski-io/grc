// middleware for doing role-based permissions

export default function orgUnitPermit(...allowed) {
  let isAllowed = role => _.indexOf(allowed, role) > -1;
  
  // return a middleware
  return (req, res, next) => {
    if (req.user && isAllowed(req.user.role))
      next(); // role is allowed, so continue on the next middleware
    else {

      const body = req.body;
      const param = req.param;
      const query = req.query;
      
      if (body.responsibleOrg) {
      	OrgUnitMembership.find({user : req.user._id}, (err , memberships) => {
      		let orgUnits = _.map(memberships, 'orgUnit');
      		isAllowed = _.indexOf(orgUnits, { id : body.responsibleOrg}) > -1;
      		if (isAllowed) {
      			next();
      		}
      	});
      }else{

      }
      res.status(403).json({message: "Forbidden"}); // user is forbidden
    }
  }
}
