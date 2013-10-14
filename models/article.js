// Dependencies

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Schema

var ArticleSchema = new Schema({
	title: {type : String, default : '', trim : true},
	author: {type : String, default : '', trim : true},
	body: {type : String, default : '', trim : true},
	comments: [{
		author: {type : String, default : '', trim : true},
		body: {type : String, default : '', trim : true},
		date: { type: Date, default: Date.now }
	}],
	date: { type: Date, default: Date.now }
});


// Validation

ArticleSchema.path('title').validate(function(title) {
	return title.length > 0;
}, 'Article title cannot be blank');

ArticleSchema.path('title').validate(function(title) {
	return title.length > 0;
}, 'Article body cannot be blank');


// Methods

ArticleSchema.methods = {

	addComment: function(user, comment) {
		this.comments.push({
			author: user,
			body: comment
		});
		this.save();
	}

};


module.exports = mongoose.model("ArticleModel", ArticleSchema);