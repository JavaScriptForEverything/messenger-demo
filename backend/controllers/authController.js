const jwt = require('jsonwebtoken')
const { apiFeatures } = require('../utils')
const { appError, catchAsync } = require('./errorController')
const Message = require('../models/messageModel')
const User = require('../models/userModel')

exports.protect = catchAsync(async (req, res, next) => {
	const token = req.cookies.token
	if(!token) return next(appError('No token: Please login first'))

	const { id, iat } = jwt.verify(token, process.env.JWT_SECRET)
	
	const user = await User.findById( id )
	if( !user ) return next(appError('No user: You are not valid user'))

	// // Check is password changed after provide token 
	// const changeTime = user.passwordChangeAt?.getTime() / 1000 	// time in second instead of ms
	// const isPasswordChanged = iat < changeTime 													// lessthan means created before password change
	// if( isPasswordChanged ) return next(appError('Password Changed: You token is no more valid, please login again'))

	req.user = user

	next()
})


// // GET /api/users/friends 	
// exports.getFriends = (req, res, next) => {
// 	const logedInUser = req.user 		// Step-1: must be prtected

// 	// mongoDB filter
// 	req.filterObject = { 						// Step-2: Add filter
// 		_id: { $ne: logedInUser._id }
// 	}

// 	next() 													// Step-3: pass to getAllUser()
// }




// GET /api/users/friends 	
exports.getFriends = async (req, res, next) => {
	const logedInUser = req.user 		// Step-1: must be prtected

	const filter = { 						
		_id: { $ne: logedInUser._id }
	}

	const users = await apiFeatures(User, req.query, filter).populate('latestMessage')
	if(!users) return next(appError('No user found'))
	// console.log(users)
	
	res.status(201).json({
		status: 'success',
		count: users.length,
		data: users
	})
}

const getLastMessage = () => {
	
}



// // GET /api/messages/conversasion/:id 	
// exports.getConversationMessages = (req, res, next) => {
// 	const logedInUser = req.user 		// Step-1: must be prtected
// 	const senderId = logedInUser.id
// 	const receiverId = req.params.id

// 	// mongoDB filter
// 	req.filterObject = { 						// Step-2: Add filter
// 		sender: { $eq: senderId },
// 		receiver: { $eq: receiverId },
// 	}

// 	next() 													// Step-3: pass to getMessages()
// }
