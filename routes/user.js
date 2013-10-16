var User = require('../models/user.js');

exports.signup = function(req, res) {
	res.render('signup.jade', {
		title: 'Signup',
		user: req.user
	});
};

exports.signupPost = function(req, res) {
	var newUser = User({
		username: req.param('username'),
		password: req.param('password')
	});
	newUser.save(function(error, user) {
		if (error) {
			// TODO
		} else {
			// TODO
		}
	});
};

exports.login = function(req, res) {
	// TODO
};

exports.loginPost = function(req, res) {
	// TODO
}

exports.account = function(req, res) {
	res.render('account.jade', {
		title: 'Account',
		user: req.user
	});
};

exports.logout = function(req, res) {
	req.logout();
	res.redirect('/');
};