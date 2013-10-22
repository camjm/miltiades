var User = require('../models/user.js');
var passport = require('passport');

exports.list = function(req, res) {
	res.render('user/list.jade', {
		title: 'Signup',
		user: req.user,
		users: null	// TODO	
	});
};

exports.signup = function(req, res) {
	res.render('user/signup.jade', {
		title: 'Signup',
		user: req.user
	});
};

exports.signupPost = function(req, res) {
	var newUser = User({
		username: req.param('username'),
		password: req.param('password'),
		email: req.param('email')
	});
	newUser.save(function(error, user) {
		if (error) {
			if (error.name !== "ValidationError") throw error;
			// show user validation errors on signup
			res.render('user/signup.jade', {
				title: 'Signup',
				user: req.user,
				errors: error.errors
			});
		} else if (user) {
			// login the new user once successfully signed up
			req.logIn(user, function (error) {
				if (error) {
					next(error);
				} else {
					res.redirect('/blog');
				}
			});
		}
	});
};

exports.login = function(req, res) {
	res.render('user/login.jade', {
		title: 'Login',
		user: req.user
	});
};

exports.loginPost = function(req, res, next) {
	passport.authenticate('local', function(error, user, info) {
		if (error) { 
			return next(error); 
		}
		if (!user) {
			  return res.render('user/login.jade', {
				title: 'Login',
				user: req.user,
				message: info
			});
		}
		req.logIn(user, function(error) {
	  		if (error) { 
	  			return next(error); 
	  		}
	  		var url = '/blog';
	  		if (req.session.returnUrl) {
	      		url = req.session.returnUrl;
	      		delete req.session.returnUrl;
		    }
	  		return res.redirect(url);
		});
	})(req, res, next);
};

exports.account = function(req, res) {
	res.render('user/account.jade', {
		title: 'Account',
		user: req.user
	});
};

exports.logout = function(req, res) {
	req.logout();
	res.redirect('/');
};