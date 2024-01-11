
let logedInUsers = []
// const User = require('../models/userModel')

// const addUser = async (userId, socketId) => {
// 	try {
// 		const user = await User.findById(userId)
// 		if(!user) return new Error('User not found')

// 		const userFound = logedInUsers.find( logedInUser => {

// 			console.log(logedInUser.id, userId)
// 			return logedInUser.id === userId
// 		}
// 			)

// 		if(userFound) return
// 		logedInUsers.push( { ...user, socketId } )
		
// 	} catch (error) {
// 		console.log('fetch user failed: socket.io: ', error.message)
// 	}

// }

// module.exports = (io) => (socket) => {
// 	console.log('connected to socket.io')

// 	socket.on('add-user', ({ user }) => {
// 		if(user.id) {
// 			if(logedInUsers.find(logedInUser => logedInUser.id === user.id )) return

// 			logedInUsers.push({ ...user, socketId: socket.id })
// 		}

// 		socket.emit('get-users', logedInUsers)
// 	})
// }

module.exports = (io) => (socket) => {
	console.log('user is connected')

	socket.on('add-user', ({ userId }) => {
		if(userId) {
			if(logedInUsers.find(logedInUser => logedInUser.userId === userId )) return

			logedInUsers.push({ userId, socketId: socket.id })
		}

		io.emit('get-users', logedInUsers)
	})

	socket.on('send-message', (data) => {
		// socket.emit('send-message', data) 		// send message to user whe send
		// io.emit('send-message', data) 				// send message to every user

		socket.to(data.socketId).emit('send-message',  data) 	// send message to only user has socketId === socket.id
	})

	socket.on('typing', (data) => {
		// console.log(data)
		socket.to(data.socketId).emit('typing', data)
	})


	socket.on('disconnect', () => {
		console.log('disconnected user')

		logedInUsers = logedInUsers.filter(user =>  user.socketId !== socket.id )
		io.emit('get-users', logedInUsers)
	})
}
