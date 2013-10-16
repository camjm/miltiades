var Article = require('../models/article.js');

exports.list = function (req, res) {
	Article.find(function(error, articles) {
		if (error) {
			// redirect to 500
		} else {
			res.render('list.jade', {
	    		title: 'Blog',
	    		user: req.user,
	    		articles: articles
			});
		}
	});
};

exports.show = function (req, res) {
	// TODO
};

exports.addComment = function (req, res) {
	// TODO
};

exports.enterNew = function (req, res) {
	res.render('new.jade', {
		title: 'New Post',
		user: req.user
	});
};

exports.submitNew = function (req, res) {
	var newArticle = new Article({
		title: req.param('title'),
		author: req.param('author'),
		body: req.param('body')
	});
	newArticle.save(function(error, article) {
		if (error) {
			// redirect to 500
		} else {
			res.redirect('/');
		}
	});
};