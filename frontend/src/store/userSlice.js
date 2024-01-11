import { createSlice } from '@reduxjs/toolkit';

/* We used proxy: http://localhost:5000 in frontend/package.json, so 
		. Neighther we need allow CORS in server-side
		. Nor we need full path path request

			fetch('http://localhost:5000/api/users, {...}) 			=>
			fetch('/api/users, {...}) 													=> OK too

	Remember: We must deploy react app to backend public folder, else both this 2 problems occours:
		1. CORS origin block
		2. need full path
*/ 

const initialState = {
	error: '',
	loading: false,
	isAuthenticated: false,
	message: '',
	token: localStorage.getItem('token') || '',
	user: {},
	friends: [],
}



const { actions, reducer } = createSlice({
	name: 'user',
	initialState,
	reducers: {
		requested: (state, action) => ({ ...state, error: '' }),
		failed: (state, action) => ({ ...state, loading: false, error: action.payload }),
		login: (state, action) => ({
			...state,
			loading: false,
			token: action.payload.token,
			message: action.payload.message
		}),
		logout: (state) => ({
			// token: '',
			// isAuthenticated: false,
			...initialState,
			token: '',
		}),
		setUser: (state, action) => ({
			...state,
			loading: false,
			user: action.payload,
			isAuthenticated: true
		}),
		setFriends: (state, action) => ({
			...state,
			loading: false,
			friends: action.payload,
		}),
		setActiveFriends: (state, action) => ({
			...state,
			loading: false,
			friends: state.friends.map( friend => ({ 
				...friend, 
				isActive: action.payload.some( activeUser => activeUser.userId === friend.id ),
				socketId: action.payload.find( activeUser => activeUser.userId === friend.id )?.socketId,
			}))
		}),

		updateCurrentFiendMessage: (state, { payload: { sender, message } = {}}) => {
			return {
				...state,
				friends: state.friends.map( (friend) => friend.id === sender.id ? { 
					...friend, 
					latestMessage: { 
						...friend.latestMessage,
						createdAt: Date.now(),
						message 
					} 
				} : friend)
			}
		}
		
	}
})
export default reducer


// /src/page/App.js 	: useEffect
export const getUserById = (id) => async (dispatch) => {
	try {
		const res = await fetch(`/api/users/${id}`, { 	
			headers: { 'Content-Type': 'application/json' }
		})

		if(!res.ok) throw new Error(res.statusText)

		const data = await res.json()
		dispatch(actions.setUser(data.data))

	} catch (error) {
		dispatch(actions.failed(error.message))
	}
}



// /src/page/register.js 	: submitHandler
export const registerUser = (fields) => async (dispatch) => {
	dispatch(actions.requested())
	try {
		const res = await fetch('/api/users/register', { 	
			method: 'POST',
			body: JSON.stringify(fields),
			headers: { 'Content-Type': 'application/json' }
		})

		if(!res.ok) throw new Error(res.statusText)

		const data = await res.json()
		console.log(data)

	} catch (error) {
		dispatch(actions.failed(error.message))
	}
}


// /src/page/login.js 	: submitHandler
export const loginUser = (fields) => async (dispatch) => {
	dispatch(actions.requested())
	try {
		const res = await fetch('/api/users/login', { 	
			method: 'POST',
			body: JSON.stringify(fields),
			headers: { 'Content-Type': 'application/json' }
		})

		if(!res.ok) throw new Error(res.statusText)

		const { message, token } = await res.json()
		dispatch(actions.login({ message, token }))
		localStorage.setItem('token', token)

	} catch (error) {
		dispatch(actions.failed(error.message))
	}
}

// home page: logout button click 	: logoutHandler
export const logoutUser = () => async (dispatch) => {
	dispatch(actions.requested())
	try {
		const res = await fetch('/api/users/logout')

		if(!res.ok) throw new Error(res.statusText)

		const { message, } = await res.json()
		dispatch(actions.logout())
		localStorage.removeItem('token')

	} catch (error) {
		dispatch(actions.failed(error.message))
	}
}





// /src/home.js 	: useEffect
export const getFriends = () => async (dispatch) => {
	dispatch(actions.requested())
	try {
		const res = await fetch('/api/users/friends', { 	
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		})

		if(!res.ok) throw new Error(res.statusText)

		const { data: users } = await res.json()
		dispatch(actions.setFriends(users))

	} catch (error) {
		dispatch(actions.failed(error.message))
	}
}


export const addActiveFriends = (activeFriendsIds) => (dispatch) => {
	dispatch(actions.setActiveFriends(activeFriendsIds))
}

/* messageSendHandler():

		const data = {
			message: sendMessage,
			sender: user.id, 											// logedInUser.id
			receiver: activeFriend.id,						// conversasionUser.id
			socketId: activeFriend.socketId,			// To send data via socket.io
		}
		dispatch(addMessage(data)) 							// Send message to backend
		dispatch(updateCurrentFiendMessage(data)) 							// Send message to backend
*/ 
export const updateOtherSideActiveFriend = (data) => (dispatch) => {
	dispatch(actions.updateCurrentFiendMessage(data))	
}