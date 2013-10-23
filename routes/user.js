var User = require('../models/user.js');
var passport = require('passport');

exports.list = function(req, res) {
	User.find(function(error, users) {
		if (error) {
			throw error;
		} else {
			res.render('user/list.jade', {
				title: 'Users',
				users: users	
			});
		}
	});
	
};

exports.signup = function(req, res) {
	res.render('user/signup.jade', {
		title: 'Signup'
	});
};

exports.signupPost = function(req, res, next) {
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
		title: 'Login'
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
		title: 'Account'
	});
};

exports.logout = function(req, res) {
	req.logout();
	res.redirect('/');
};