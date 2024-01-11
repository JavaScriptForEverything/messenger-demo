import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	error: '',
	loading: false,
	message: {},
	messages: []
}



const { actions, reducer } = createSlice({
	name: 'message',
	initialState,
	reducers: {
		requested: (state) => ({ ...state, error: '' }),
		failed: (state, action) => ({ ...state, loading: false, error: action.payload }),
		setMessage: (state, action) => ({
			...state,
			loading: false,
			message: action.payload,
			messages: [ ...state.messages, action.payload ]
		}),
		setMessages: (state, action) => ({
			...state,
			loading: false,
			messages: action.payload,
		}),
	},
})
export default reducer


// /src/page/home.js 	: useEffect
export const getMessages = (receiverId) => async (dispatch) => {
	try {
		const res = await fetch(`/api/messages/conversasion/${receiverId}`, { 	
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		})

		if(!res.ok) throw new Error(res.statusText)

		const data = await res.json()
		dispatch(actions.setMessages(data.data))

	} catch (error) {
		dispatch(actions.failed(error.message))
	}
}


// /src/page/home.js 	: messageSendHandler
export const addMessage = (sendData) => async (dispatch) => {
	try {
		const res = await fetch(`/api/messages`, { 	
			method: 'POST',
			body: JSON.stringify(sendData),
			headers: { 'Content-Type': 'application/json' }
		})

		if(!res.ok) throw new Error(res.statusText)

		const data = await res.json()
		const messageDoc = data.data
		dispatch(actions.setMessage(messageDoc))

	} catch (error) {
		dispatch(actions.failed(error.message))
	}
}

// 
export const addMessageOfSocketResponse = (sendData) => (dispatch) => {
	// make sure it has all the data as addMessage data.data has else UI throw error
	dispatch(actions.setMessage(sendData))
}




