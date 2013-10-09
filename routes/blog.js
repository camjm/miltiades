var ArticleProvider = require('../articleprovider-mongodb').ArticleProvider;

var articleProvider = new ArticleProvider('localhost', 27017);

exports.list = function(req, res) {
    articleProvider.findAll(function(error, docs) {
    	res.render('index.jade', {
    		title: 'Blog',
    		articles: docs
		});
    });
};

exports.single = function(req, res) {
	articleProvider.findById(req.params.id, function(error, article) {
		res.render('blog_show.jade', {
			title: article.title,
			article: article
		});
	});
};

exports.addComment = function(req, res) {
	articleProvider.addCommentToArticle(req.param('_id'), {
		person: req.param('person'),
		comment: req.param('comment'),
		created_at: new Date
	}, function(error, docs) {
		res.redirect('/blog/' + req.param('_id'));
	});
};

exports.newBlog = function(req, res) {
	res.render('blog_new.jade', {
		title: 'New Post'
	});
};

exports.postNew = function(req, res) {
	articleProvider.save({
		title: req.param('title'),
		body: req.param('body')
	}, function(error, docs) {
		res.redirect('/');
	});
};