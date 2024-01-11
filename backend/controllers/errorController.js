exports.catchAsync = (fn) => {
	return (req, res, next) => {
		return fn(req, res, next).catch(next)
	}
}

exports.appError = (message='', statusCode=400, status='error') => {
	const error = new Error(message) 	
	error.statusCode = statusCode
	error.status = status

	return error
}


exports.pageNotFound = (req, res, next) => {
	next(this.appError(`page ${req.originalUrl} dose not exists`))
}


exports.errorHandler = (err, req, res, next) => {
	res.status(err.statusCode || 404).json({
		message: err.message,
		status: err.status || 'failed',
		stack: process.env.Node_ENV === 'production' ? undefined : err.stack
	})
}



