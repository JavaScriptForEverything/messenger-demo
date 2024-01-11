require('dotenv').config()
const { createServer } = require('http')
const { Server } = require('socket.io')

const app = require('./app')
const dbConnect = require('./models/dbConnect')
const socketController = require('./controllers/socketController')

const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' }})

const PORT = process.env.PORT || 5000
httpServer.listen( PORT, async () => {
	await dbConnect()
	console.log(`server runnint on http://localhost:${PORT}`)
})

io.on('connection', socketController(io))
