const { Router } = require('express')
const messageController = require('../controllers/messageController')
const authController = require('../controllers/authController')

// => /api/messages
const router = Router()

router.get('/conversasion/:id', 
	authController.protect,
	messageController.getConversationMessages  
)

router.route('/')
	.get(messageController.getMessages)
	.post( 
		authController.protect, 
		messageController.addMessage )

router.route('/:id')
	.get(messageController.getMessageById)


module.exports = router