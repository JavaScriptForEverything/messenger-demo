const fs = require('fs')
const { appError } = require('./errorController')
const path = require('path')

// GET /upload/*
exports.getUserFile = (req, res, next) => {
	try {
		const file = path.join(process.cwd(), req.originalUrl)

		if( !fs.existsSync(file) ) return next(appError('file not exists'))
		res.sendFile( file )

	} catch (error) {
		appError(`Read uploaded file: ${error.message}`)		
	}
}