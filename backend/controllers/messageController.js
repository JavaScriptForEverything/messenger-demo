const { Types } = require('mongoose')
const Message = require('../models/messageModel')
const { filterObjectByArray, apiFeatures, handleBase64File } = require('../utils')
const { appError, catchAsync } = require('./errorController')
const User = require('../models/userModel')




// GET 	/api/messages
exports.getMessages =  catchAsync(async (req, res, next) => {
	const filter = req.filterObject || {}
	// const messages = await Message.find( filter )
	const messages = await apiFeatures(Message, req.query, filter)

	res.status(201).json({
		status: 'success',
		count: messages.length,
		data: messages
	})
})

// // GET /api/messages/conversasion/:id 	
exports.getConversationMessages = async (req, res, next) => {
	const logedInUser = req.user 		// Step-1: must be prtected
	const senderId = logedInUser.id
	const receiverId = req.params.id


	const filter = req.filterObject || {
		$or: [
			{ $and: [
				{ "sender": { $eq: new Types.ObjectId(senderId) } },
				{ "receiver": { $eq: new Types.ObjectId(receiverId) } }
			]},
			{ $and: [
				{ "sender": { $eq: new Types.ObjectId(receiverId) } },
				{ "receiver": { $eq: new Types.ObjectId(senderId) } }
			]},
		]
	}
	const messages = await apiFeatures(Message, req.query, filter)

	res.status(201).json({
		status: 'success',
		count: messages.length,
		data: messages
	})
}


// POST 	/api/messages + protect
exports.addMessage =  catchAsync(async (req, res, next) => {
	const allowedFields = ['message', 'image', 'sender', 'receiver']
	const body = filterObjectByArray(req.body, allowedFields)

	if(body.image) {
		const { error, url } = await handleBase64File(body.image, '/images')
		if(error) return next(appError('upload image failed'))
		body.image = url
	}

	const message = await Message.create( body )
	if(!message) return next(appError('create message in database is failed'))

	const userId = req.user._id
	await User.findByIdAndUpdate(userId, {
		latestMessage: message._id
	})

	res.status(201).json({
		status: 'success',
		data: message
	})
})


// GET 	/api/messages/:id
exports.getMessageById =  catchAsync(async (req, res, next) => {
	const messageId = req.params.id

	const message = await Message.findById( messageId )
	if(!message) return next(appError('find message ById is failed'))

	res.status(200).json({
		status: 'success',
		data: message
	})
})

