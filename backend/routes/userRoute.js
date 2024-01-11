const { Router } = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

// => /api/users
const router = Router()

router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/logout', userController.logout)

router.get('/friends',  authController.protect, authController.getFriends, userController.getAll)

router.get('/',  authController.protect, userController.getAll)
router.get('/:id', userController.getUserById)

module.exports = router