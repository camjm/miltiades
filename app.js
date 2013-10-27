// Module dependencies.
var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var passport = require('passport');

var blog = require('./routes/blog');
var index = require('./routes/index');
var user = require('./routes/user');

var auth = require('./middleware/authorization');
var viewdata = require('./middleware/viewdata');
var unrouted = require('./middleware/unrouted');
var errorhandling = require('./middleware/errorhandling');

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
  	app.use(viewdata);
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
	app.use(unrouted);
	app.use(errorhandling);
});

app.configure('development', function() {	
	app.enable('verbose errors');
});

app.configure('production', function() {
	app.disable('verbose errors');
});

// Passport Configuration
require('./config/passport')();

// Routes
app.get('/', blog.list);
app.get('/signup', user.signup);
app.post('/signup', user.signupPost);
app.get('/login', user.login);
app.post('/login', user.loginPost);
app.get('/logout', user.logout);

// Protected Routes
app.get(
	'/users',
	[auth.ensureAuthenticated,
	auth.ensureAdmin], 
	user.list);
app.get(
	'/account', 
	auth.ensureAuthenticated, 
	user.account)
// app.get(
// 	'/blog', 
// 	auth.ensureAuthenticated, 
// 	blog.list);
app.get(
	'/blog/new', 
	[auth.ensureAuthenticated,
	auth.ensureAdmin], 
	blog.enterNew);
app.post(
	'/blog/new', 
	[auth.ensureAuthenticated,
	auth.ensureAdmin],
	blog.submitNew);
app.get(
	'/blog/:id', 
	auth.ensureAuthenticated, 
	blog.show);
app.post(
	'/blog/addComment', 
	auth.ensureAuthenticated, 
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