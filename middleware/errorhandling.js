
function htmlError(status, error, req, res) {

	switch(status) {
		case 403:
			res.render('http/403.jade', {
				title: 'Not Authorized'
			});
			break;
		case 404:
			res.render('http/404.jade', {
				title: 'Page Not Found'
			});
			break;
		case 500:
		default:
			res.render('http/500.jade', {
				title: 'Server Error'
			});
			break;
	}

}

function jsonError(status, error, req, res) {
	req.send({
		status: status,
		error: error.message
	});
}

function defaultError(status, error, req, res) {
	// default to plain-text
	res.type('txt').send(error.message);
}

module.exports = function(error, req, res, next) {

	// add error to view data
	res.locals.error = error;

	var statusCode = error.status || 500;
	res.status(statusCode);

	if (req.accepts('html')) {
		htmlError(statusCode, error, req, res);
	} else if (req.accepts('json')) {
		jsonError(statusCode, error, req, res);
	} else {	
		defaultError(statusCode, error, req, res);
	}

}