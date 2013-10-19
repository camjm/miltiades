var User = require('../models/user.js');
var passport = require('passport');

exports.list = function(req, res) {
	res.render('user_list.jade', {
		title: 'Signup',
		user: req.user,
		users: null	// TODO	
	});
};

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
			// show errors on signup
			res.render('signup.jade', {
				title: 'Signup',
				user: req.user,
				message: 'That username has already been taken, please select another'
			});
		} else {
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
	res.render('login.jade', {
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
			  return res.render('login.jade', {
				title: 'Login',
				user: req.user,
				message: info
			});
		}
		req.logIn(user, function(error) {
	  		if (error) { 
	  			return next(error); 
	  		}
	  		return res.redirect('/blog');
		});
	})(req, res, next);
};

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