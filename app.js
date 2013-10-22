// Module dependencies.
var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var blog = require('./routes/blog');
var index = require('./routes/index');
var user = require('./routes/user');
var passport = require('passport');
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
require('./config/passport')();

// Authorization
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.session.returnUrl = req.url;
	res.redirect('/login');
}

function ensureAdmin(req, res, next) {
	if (req.isAuthenticated() && req.user.admin) {
		return next();
	} 
	throw new Error('tessdfsdffdsdfasfdst');
	// res.statusCode = 403;
	// res.render('forbidden.jade', {
	// 	title: 'Not Authorized',
	// 	user: req.user
	// });
}

// Routes
app.get('/', index.index);
app.get('/signup', user.signup);
app.post('/signup', user.signupPost);
app.get('/login', user.login);
app.post('/login', user.loginPost);
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
	[ensureAuthenticated,
	ensureAdmin], 
	blog.enterNew);
app.post(
	'/blog/new', 
	[ensureAuthenticated,
	ensureAdmin],
	blog.submitNew);
app.get(
	'/blog/:id', 
	ensureAuthenticated, 
	blog.show);
app.post(
	'/blog/addComment', 
	ensureAuthenticated, 
	blog.addComment);


// Mongoose ODM Connection to Database
var connectionString = process.env.CUSTOMCONNSTR_MONGOLAB_URI || 'mongodb://localhost:27017';
mongoose.connect(connectionString, function(error){
	if (error) throw error;
	console.log('Successfully connected to MongoDB');
});


// Start App
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});
