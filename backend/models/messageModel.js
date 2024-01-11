const { Schema, model, models } = require('mongoose')

const messageSchema = new Schema({
	message: {
		type: String,
		trim: true,
	},
	image: {
		type: String,
		trim: true,
	},
	sender: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	receiver: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	}

}, {
	timestamps: true
})

// POST /api/messages 	:=> Message.create()
messageSchema.post(/save/, async function (doc) {
	await doc.populate('sender receiver')
})

// GET /api/messages 	:=> Message.find*()
messageSchema.pre(/^find/, function (next) {
	this.populate('sender receiver')
	next()
})

const Message = models.Message || model('Message', messageSchema)
module.exports = Message