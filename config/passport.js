var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user.js');

module.exports = function() {

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(error, user){
			done(error, user);
		});
	});

	passport.use(new LocalStrategy(function(username, password, done) {
		User.getAuthenticated(username, password, function(error, user, reason) {
			if (error) {
				return done(error);
			}
			if (user) {
				return done(null, user);
			}
			var message;
			switch(reason) {
				case User.failedLogin.NOT_FOUND:
				case User.failedLogin.PASSWORD_INCORRECT:
					message = "Incorrect username and/or password";
					break;
				case User.failedLogin.MAX_ATTEMPTS:
					message = "Max attempts"
			}
			return done(null, false, message);
		});
	}));

};