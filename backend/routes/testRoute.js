const { Router } = require('express')
const testController = require('../controllers/testController')

// /api/tests
const router = Router()

router.post('/', testController.urlForm)

module.exports = router