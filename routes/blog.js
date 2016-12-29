var Article = require('../models/article.js');

exports.list = function (req, res) {
	Article.find(function(error, articles) {
		if (error) {
			throw error;
		} else {
			res.render('blog/list.jade', {
				title: 'Blog',
				articles: articles
			});
		}
	});
};

exports.show = function (req, res) {
	var id = req.params.id;
	Article.findById(id, function(error, article){
		if (error) {
			throw error;
		} else {
			res.render('blog/show.jade', {
				title: 'Blog Post',
				article: article
			});
		}
	});
};

exports.addComment = function (req, res) {
	// TODO
};

exports.enterNew = function (req, res) {
	res.render('blog/new.jade', {
		title: 'New Post'
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
			throw error;
		} else {
			res.redirect('/');
		}
	});
};