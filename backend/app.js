const path = require('path')
const livereload = require('livereload') 									// for reload browser
const connectLivereload = require('connect-livereload') 	// for reload browser
const express = require('express')
const cookieParser = require('cookie-parser')

const { errorHandler, pageNotFound } = require('./controllers/errorController')
const fileRouter = require('./routes/fileRoute')
const userRouter = require('./routes/userRoute')
const messageRouter = require('./routes/messageRoute')
const testRouter = require('./routes/testRoute')

const publicDirectory = path.join(process.cwd(), 'public')

// handle Synchronous / Blocking Error
process.on('uncaughtException', (err) => {
	console.log(`uncaughtException Error: ${err.message}`)
})

const app = express()

app.set('view engine', 'pug')
app.use(express.static( publicDirectory ))

// -----[ For LiveReload ]-----
// Used for development purpose: To reload browser on file changes
if(process.env.NODE_ENV === 'development') {
	const livereloadServer = livereload.createServer() 				// for reload browser
	livereloadServer.watch(publicDirectory)
	livereloadServer.server.once('connection', () => {
		setTimeout(() => livereloadServer.refresh('/') , 10);
	})

	app.use(connectLivereload()) 													// for reload browser
}



app.use(express.urlencoded({ extended: false })) 		// allow FormData data on : req.body
app.use(express.json({ limit: '5MB' })) 						// allow json data on 		: req.body
app.use(cookieParser()) 														// allow cookies object 	: req.cookies

app.use('/upload', fileRouter)
app.use('/api/users', userRouter)
app.use('/api/messages', messageRouter)
app.use('/api/tests', testRouter)

app.get('/', (req, res) => {
	const payload = {
		title: 'Home Page',
	}
	res.render('./pages/home', payload)
})




app.all('*', pageNotFound)
app.use(errorHandler)


// handle Asynchronous / Non-Blocking Error
process.on('unhandledRejection', (err) => {
	console.log(`unhandledRejection Error: ${err.message}`)
})


module.exports = app