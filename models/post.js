// Dependencies

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Schema

var PostSchema = new Schema({
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

PostSchema.path('title').validate(function(title) {
	return title.length > 0;
}, 'Post title cannot be blank');

PostSchema.path('title').validate(function(title) {
	return title.length > 0;
}, 'Post body cannot be blank');

module.exports = mongoose.model("TaskModel", PostSchema);


// Methods

PostSchema.methods = {

	addComment: function(user, comment) {
		this.comments.push({
			author: user,
			body: comment
		});
		this.save();
	}

};