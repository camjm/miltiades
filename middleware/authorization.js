
exports.ensureAuthenticated = function(req, res, next) {

	if (req.isAuthenticated()) {
		return next();
	} else {
		req.session.returnUrl = req.url;
		res.redirect('/login');
	}
	
};

exports.ensureAdmin = function(req, res, next) {

	if (req.isAuthenticated() && req.user.admin) {
		return next();
	} else {
		var error = new Error('Not Authorized');
		error.status = 403;
		next(error);
	}

};