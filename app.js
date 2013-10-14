// Module dependencies.
var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var blog = require('./routes/blog');
var index = require('./routes/index');

var app = express();


// Configuration
app.configure( function() {
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(require('stylus').middleware({src: __dirname + '/public'}));
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
	app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

app.configure('production', function() {
	app.use(express.errorHandler());
});


// Routes
app.get('/', index.index);
app.get('/blog', blog.list);
app.get('/blog/new', blog.enterNew);
app.post('/blog/new', blog.submitNew);
app.get('/blog/:id', blog.show);
app.post('/blog/addComment', blog.addComment);


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
