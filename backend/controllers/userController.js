const { isValidObjectId } = require('mongoose')
const { filterObjectByArray, handleBase64File, removeFile, createToken, setCookie, apiFeatures } = require('../utils')
const { appError, catchAsync } = require('./errorController')
const User = require('../models/userModel')


// POST /api/users/register
exports.register = async (req, res, next ) => {
	try {
		const allowedFields = ['name', 'email', 'password', 'confirmPassword', 'avatar']
		const body = filterObjectByArray(req.body, allowedFields)

		if(!body.avatar) return next(appError('avatar is missing'))
		const { error, url } = await handleBase64File(body.avatar, '/users', 'image')
		if(error) return next(appError('file upload failed'))

		body.avatar = url 											// replace dataUrl with uploaded url 
		req.body.avatar = url 									// To delete avatar file if failed

		const user = await User.create(body)
		if(!user) return next(appError('user registation failed'))
		user.password = undefined 							// Don't send password to user
		
		res.status(201).json({
			status: 'success',
			message: 'your register is successfull',
			data: {}
		})
	} catch (error) {
		removeFile(req.body.avatar)
		next(appError(error.message))
	}

}
// POST /api/users/login
exports.login = catchAsync( async(req, res, next) => {
	const allowedFields = ['email', 'password']
	const body = filterObjectByArray(req.body, allowedFields)

	const user = await User.findOne({ email: body.email }).select('+password')
	if(!user) return next(appError('email or password is incorrect'))

	const isPasswordMatched = user.isPasswordValid(body.password, user.password)
	if(!isPasswordMatched) return next(appError('email or password is incorrect'))
	
	const token = createToken( user.id )
	setCookie(res, 'token', token)
	
	res.status(201).json({
		status: 'success',
		message: 'your login is successfull',
		token,
	})
})
// GET /api/users/logout
exports.logout = catchAsync( async(req, res, next) => {
	setCookie(res, 'token', '')
	// res.cookie('token', '', { expires: new Date() - 1000 })
	
	res.status(200).json({
		status: 'success',
		message: 'logout is successfull',
	})
})


// GET /api/users/:id
exports.getUserById = catchAsync( async(req, res, next) => {
	const userId = req.params.id
	if( !isValidObjectId(userId) ) return next(appError('Not valid ObjectId'))

	const user = await User.findById(userId)
	if(!user) return next(appError('No user found'))

	
	res.status(201).json({
		status: 'success',
		data: user
	})
})


// GET /api/users
exports.getAll = catchAsync( async(req, res, next) => {

	const filter = req.filterObject || {}

	// const users = await User.find( filter )
	const users = await apiFeatures(User, req.query, filter)
	if(!users) return next(appError('No user found'))
	
	res.status(201).json({
		status: 'success',
		count: users.length,
		data: users
	})
})

