// Module dependencies.
var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var blog = require('./routes/blog');
var index = require('./routes/index');
var user = require('./routes/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var UserModel = require('../models/user.js');


var app = express();


// Configuration
app.configure( function() {
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.cookieParser());
	app.use(express.session({secret:'walrus woman'}));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(require('stylus').middleware({src: __dirname + '/public'}));
	app.use(passport.initialize());
  	app.use(passport.session());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
	app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

app.configure('production', function() {
	app.use(express.errorHandler());
});

// Passport Configuration
passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	UserModel.findById(id, function(error, user){
		done(error, user);
	});
});

passport.use(new LocalStrategy(function(username, password, done) {
	UserModel.getAuthenticated(username, password, function(error, user, reason) {
		if (error) {
			return done(error);
		}
		if (user) {
			return done(null, user);
		}
		var message;
		switch(reason) {
			case UserModel.failedLogin.NOT_FOUND:
			case UserModel.failedLogin.PASSWORD_INCORRECT:
				message = "Incorrect username and/or password";
				break;
			case UserModel.failedLogin.MAX_ATTEMPTS:
				message = "Max attempts"
		}
		return done(null, false, message);
	});
}));

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}

// Routes
app.get('/', index.index);
app.get('/singup', user.signup);
app.post('/signup', user.signupPost);
app.get('/login', function (req, res) {
	res.render('login.jade', {
		title: 'Login',
		user: req.user,
		message: req.session.messages
	});
});
app.post(
	'/login', 
	passport.authenticate('Local', {
		failureRedirect: '/login',
		failureFlash: true	// What is this? Can be a string
	}),
	function (req, res) {
		res.redirect('/');
	}
);
app.get('/logout', user.logout);

// Protected Routes
app.get(
	'/account', 
	ensureAuthenticated, 
	user.account)
app.get(
	'/blog', 
	ensureAuthenticated, 
	blog.list);
app.get(
	'/blog/new', 
	ensureAuthenticated, 
	blog.enterNew);
app.post(
	'/blog/new', 
	ensureAuthenticated, 
	blog.submitNew);
app.get(
	'/blog/:id', 
	ensureAuthenticated, 
	blog.show);
app.post(
	'/blog/addComment', 
	ensureAuthenticated, 
	blog.addComment);


// ODM Connection to Database
var connectionString = process.env.CUSTOMCONNSTR_MONGOLAB_URI || 'mongodb://localhost:27017';
mongoose.connect(connectionString, function(error){
	if (error) throw error;
	console.log('Successfully connected to MongoDB');
});


// Start
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});
