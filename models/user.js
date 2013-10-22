// Dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

// Constants
var SALT_WORK_FACTOR = 10;
var MAX_LOGIN_ATTEMPTS = 5;
var LOCK_TIME = 2 * 60 * 60 * 1000;	// 2 hour lock

// Schema
var UserSchema = new Schema({
	username: { type: String, required: true, index: { unique: true } },
	password: { type: String, required: true },
	email: { type: String, required: true },
	admin: { type: Boolean, required: true, default: false },
	loginAttempts: { type: Number, required: true, default: 0 },
	lockUntil: { type: Number }
});

// Virtuals
UserSchema.virtual('isLocked').get(function() {
	return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-Save Hook
UserSchema.pre('save', function(next) {
	// only hash the password if it has been modified (or is new)
	var user = this;
	if (!user.isModified('password')) return next();

	// generate salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function(error, salt) {
		if (error) return next(error);

		// hash the password along with our new salt
		bcrypt.hash(user.password, salt, null, function(error, hash) {
			if (error) return next(error);

			// override the cleartext password with the hashed one
			user.password = hash;
			next();
		});
	});
});

// Methods
UserSchema.methods = {

	comparePassword: function(candidatePassword, callback) {
		bcrypt.compare(candidatePassword, this.password, function(error, isMatch) {
			if (error) return callback(error);
			callback(null, isMatch);
		});
	},

	incLoginAttempts: function(callback) {
		// if we have a previous lock that has expired, restart at 1
		if (this.lockUntil && this.lockUntil < Date.now()) {
			return this.update({
				$set: { loginAttempts: 1 },
				$unset: { lockUntil: 1 }
			}, callback);
		}

		// otherwise we're incrementing
		var updates = { $inc: { loginAttempts: 1 } };

		// lock the account if we've reached max attempts and it's not locked already
		if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
			updates.$set = { lockUntil: Date.now() + LOCK_TIME };
		}
		return this.update(updates, callback);
	}

};

// Statics
var reasons = UserSchema.statics.failedLogin = {
	NOT_FOUND: 0,
	PASSWORD_INCORRECT: 1,
	MAX_ATTEMPTS: 2
};

UserSchema.statics.getAuthenticated = function(username, password, callback) {
	this.findOne({username: username}, function(error, user){
		if (error) return callback(error);

		// make sure the user exists
		if (!user) return callback(null, null, reasons.NOT_FOUND);

		// check if the account is currently locked
		if (user.islocked) {
			// just increment login attempts if account is already locked
            return user.incLoginAttempts(function(error) {
                if (error) return callback(error);
                return callback(null, null, reasons.MAX_ATTEMPTS);
            });
		}

		// test for a matching password
		user.comparePassword(password, function(error, isMatch) {
			if (error) return callback(error);

			// check if the password was a match
			if (isMatch) {
				// if there's no lock or failed attempts, just return the user
                if (!user.loginAttempts && !user.lockUntil) return callback(null, user);

                // reset attempts and lock info
                var updates = {
                    $set: { loginAttempts: 0 },
                    $unset: { lockUntil: 1 }
                };
                return user.update(updates, function(error) {
                    if (error) return callback(error);
                    return callback(null, user);
                });
			}

			// password is incorrect, so increment login attempts before responding
			user.incLoginAttempts(function(error) {
				if (error) return callback(error);
				return callback(null, null, reasons.PASSWORD_INCORRECT);
			});
		});
	});
};

// Validation
var UserModel =  mongoose.model("UserModel", UserSchema);

UserModel.schema.path('username').validate(function(username, callback) {
	UserModel.findOne({username: username}, function(error, user) {
		if (error) throw error;
		callback(!user);
	});
}, 'Username has already been taken');

UserModel.schema.path('password').validate(function(password) {
	return password.length > 3;
}, 'Password must be atleast 4 characters long');

UserModel.schema.path('email').validate(function(email) {
	var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
	return emailRegex.test(email);
}, 'User email must be valid');

UserModel.schema.path('email').validate(function(email, callback) {
	UserModel.findOne({email: email}, function(error, user) {
		if (error) throw error;
		callback(!user);
	});
}, 'Email is taken by another user');

// Module Export
module.exports = UserModel;