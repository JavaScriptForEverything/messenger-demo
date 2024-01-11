import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addActiveFriends, getFriends, logoutUser, updateOtherSideActiveFriend } from '../store/userSlice'
import { addMessage, addMessageOfSocketResponse, getMessages } from '../store/messageSlice'
import { timeSince } from '../utils'

const emojies = [
	'😀', '😁', '😂', '😃', '😄', '😅', '😆', '😇', '😈', '😉', 
	'😊', '😋', '😌', '😍', '😎', '😏', '😐', '😑', '😒'
]

let timer = 0
const Home = ({ socket }) => {
	const dispatch = useDispatch()
	const { user, friends } = useSelector(state => state.user)
	const { message, messages } = useSelector(state => state.message)
	const [ activeFriend, setActiveFriend ] = useState({})
	const [ sendMessage, setSendMessage ] = useState('')
	const [ isTyping, setIsTyping ] = useState(false)

	const lastMessageRef = useRef()
	const sendEmojiRef = useRef()
	const notificationRef = useRef()

	useEffect(() => {
		dispatch(getFriends())
	}, [dispatch])

	useEffect(() => {
		if( friends.length ) setActiveFriend(friends[0])
	}, [friends])

	useEffect(() => {
		if( activeFriend.id ) dispatch(getMessages(activeFriend.id))
	}, [dispatch, activeFriend.id])

	useEffect(() => { // scroll to bottom: At first
		lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [])
	useEffect(() => { // scroll to bottom: by visible into view
		lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [message])


	useEffect(() => {
		socket.emit('add-user', { userId: user.id })
	}, [socket, user.id])


	useEffect(() => {
		socket.on('get-users', (logedInUsersIds) => {
			dispatch(addActiveFriends(logedInUsersIds))
		})
	}, [socket, dispatch, activeFriend ])

	useEffect(() => {
		socket.on('send-message', (data) => { 						// 3. get return value from backend socket.io
			// this the the 2nd user's part: from socket.io's point of view

			if(data && activeFriend.socketId ) {
				if(data.sender.id === activeFriend.id && data.receiver.id === user.id ) {
					dispatch(addMessageOfSocketResponse( data)) 		// modify other user state, with same action : just ignore api request 
					// notificationRef.current.play()
					dispatch(updateOtherSideActiveFriend(data))
				}
			}
		})
	}, [socket, activeFriend.id, activeFriend.socketId, user.id, dispatch])

	useEffect(() => {
		socket.on('typing', (data) => {
			clearTimeout( timer )

			setIsTyping(true)
			timer = setTimeout(() => {
				setIsTyping(false)
			}, 3000)
		})
	}, [socket, sendMessage])


	const listClickHandler = (friend) => () => {
		setActiveFriend(friend)
	}
	const sendMessageChangeHandler = (evt) => {
		setSendMessage( evt.target.value )

		const data = {
			socketId: activeFriend.socketId,			// To send data via socket.io
			sender: user.id,
			receiver: activeFriend.id,
		}
		socket.emit('typing', data)
	}
	const emojiClickHandler = (emoji) => () => {
		setSendMessage( oldMessage => `${oldMessage} ${emoji} `)
	}

	const messageSendHandler = () => {
		if(!sendMessage) return 

		const data = {
			message: sendMessage,
			sender: user.id, 											// logedInUser.id
			receiver: activeFriend.id,						// conversasionUser.id
			socketId: activeFriend.socketId,			// To send data via socket.io
		}
		dispatch(addMessage(data)) 							// Send message to backend
		setSendMessage('') 											// Empty message input.value
		sendEmojiRef.current.checked = false 		// uncheck emoji panel if exists

		const randomUUID = crypto.randomUUID()
		const messageDocMimic = {
			socketId: activeFriend.socketId,			// To send data via socket.io
			id: randomUUID,
			_id: randomUUID,
			message: sendMessage,
			image: '',
			sender: { avatar: user.avatar, id: user.id },
			receiver: { avatar: activeFriend.avatar, id: activeFriend.id },
		}
		socket.emit('send-message', messageDocMimic) 

		notificationRef.current.play()
	}
	const sendMessageSubmitHandler = (evt) => {
		if(evt.key !== 'Enter') return
		messageSendHandler()
	}

	const imageChangeHandler = (evt) => {
		const File = evt.target.files[0]
		
		const reader = new FileReader()
		reader.readAsDataURL(File)
		reader.addEventListener('loadend', () => {
			
			const data = {
				image: reader.result,
				sender: user.id, 											// logedInUser.id
				receiver: activeFriend.id 						// conversasionUser.id
			}
			dispatch(addMessage(data)) 							// Send message to backend
		})
		
	}


	const logoutHandler = () => {
		dispatch(logoutUser())		
	}

	return (
		<main className='grid grid-cols-12 h-screen text-slate-800 '>
			<audio ref={notificationRef} >
				<source src='/sound/notification.mp3' />
			</audio>

			<input type="checkbox" id='hamburger-icon' className='peer/hamburger' hidden />
			<aside name='left-side' id='left-panel' className='hidden sm:block sm:col-span-3 peer-checked/hamburger:hidden border-r border-slate-200'>
				<div name='left-top' className='px-4 h-12 mb-2 border-b border-slate-200 flex justify-between items-center'>
					<div className='flex gap-2 items-center h-12'>
						<img src={ user.avatar || '/logo.png'} alt='avatar' className='rounded-full w-8 h-8' />
						<p className='font-medium'>{user.name}</p>
					</div>
					<label htmlFor="hamburger-icon" className='cursor-pointer border border-slate-300/90 p-1 rounded-full hover:bg-slate-100 active:bg-slate-200 active:border-slate-300 '>
						<svg className='w-5 h-5' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m14 7l-5 5l5 5z"/></svg>
					</label>
				</div>
				<div name='left-main' className=''>
					<div name='search-container' className="relative flex items-center mt-3">
						<label htmlFor='search' className="absolute left-2.5 text-slate-700">
							<svg className='w-4 h-4' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m21 21l-4.343-4.343m0 0A8 8 0 1 0 5.343 5.343a8 8 0 0 0 11.314 11.314"/></svg>
						</label>
						<input id='search' type='search' placeholder='Search' className='w-full border border-slate-300 pl-8 pr-3 py-1.5 rounded placeholder:text-slate-600 placeholder:text-sm focus:outline-none focus:border-slate-400 '/>
					</div>

					<div name='list-container' className="divide-y max-h-80 overflow-y-scroll ">
						{friends.map( (friend) => (
							<div onClick={listClickHandler(friend)} key={friend.id} name='user-list' className={`${friend.id === activeFriend.id ? 'bg-slate-200' : '' } px-3 cursor-pointer bg-slate-50 hover:bg-slate-100`}>
								<div className='py-1.5 flex gap-2 items-center'>
									<div className='relative w-8 h-8 flex-shrink-0'>
										<img src={ friend.avatar || '/logo.png'} alt='avatar' className='w-full rounded-full' />
										{friend.isActive && (
											<div className='absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500'></div>
										)}
									</div>
									<div className='w-full'>
										<p className='font-normal'>{friend.name} </p>
										{friend.latestMessage?.message && (
											<div className='flex justify-between '>
												<p className='text-[12px] -mt-1.5 text-slate-500 truncate'> {friend.latestMessage.message} </p> 
												<p className='text-[12px] -mt-1.5 text-slate-500 ml-1 w-24 flex-shrink-0'> { timeSince(new Date(friend.latestMessage.createdAt))} </p> 
											</div>

										)}
									</div>
								</div>
							</div>
						))}

					</div>

				</div>
			</aside>

			<section name='right-side' id='right-section' className=' col-span-12 sm:col-span-9 peer-checked/hamburger:col-span-12 peer-checked/hamburger:[&_label]:block grid grid-cols-12  ' >
				<input type='checkbox' id='three-dot-icon' className='peer/dot' hidden/>
				<div name='middle-section' className=' col-span-12 peer-checked/dot:col-span-8 '>
					<div className="h-screen flex flex-col ">

						<div name='middle-top' className="px-4 mb-2 flex justify-between border-b border-slate-200">
							<div className='flex gap-2 items-center h-12'>
								<label htmlFor='hamburger-icon' className='hidden cursor-pointer'>
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg>
								</label>
								<div className='relative w-8 h-8'>
									<img src={activeFriend.avatar || '/logo.png'} alt='avatar' className='w-full rounded-full' />
									{activeFriend.isActive && (
										<div className='absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500'></div>
									)}
								</div>
								<div className='flex flex-col gap-0'>
									<p className='font-medium '>{activeFriend.name}</p>
									{isTyping && (
										<span className='text-[12px] -mt-1.5 text-slate-500 '>typing...</span>
									)}
								</div>
							</div>

							<div className='flex gap-2 items-center h-12'>
								<button onClick={logoutHandler} name='logout' className=' border border-slate-300/90 p-1 rounded-full hover:bg-slate-100 active:bg-slate-200 active:border-slate-300 '>
									<svg className='w-4 h-4' xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><path fill="currentColor" d="M868 732h-70.3c-4.8 0-9.3 2.1-12.3 5.8c-7 8.5-14.5 16.7-22.4 24.5a353.84 353.84 0 0 1-112.7 75.9A352.8 352.8 0 0 1 512.4 866c-47.9 0-94.3-9.4-137.9-27.8a353.84 353.84 0 0 1-112.7-75.9a353.28 353.28 0 0 1-76-112.5C167.3 606.2 158 559.9 158 512s9.4-94.2 27.8-137.8c17.8-42.1 43.4-80 76-112.5s70.5-58.1 112.7-75.9c43.6-18.4 90-27.8 137.9-27.8c47.9 0 94.3 9.3 137.9 27.8c42.2 17.8 80.1 43.4 112.7 75.9c7.9 7.9 15.3 16.1 22.4 24.5c3 3.7 7.6 5.8 12.3 5.8H868c6.3 0 10.2-7 6.7-12.3C798 160.5 663.8 81.6 511.3 82C271.7 82.6 79.6 277.1 82 516.4C84.4 751.9 276.2 942 512.4 942c152.1 0 285.7-78.8 362.3-197.7c3.4-5.3-.4-12.3-6.7-12.3m88.9-226.3L815 393.7c-5.3-4.2-13-.4-13 6.3v76H488c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h314v76c0 6.7 7.8 10.5 13 6.3l141.9-112a8 8 0 0 0 0-12.6"/></svg>
								</button>


								<button name='call-icon' className=' border border-slate-300/90 p-1 rounded-full hover:bg-slate-100 active:bg-slate-200 active:border-slate-300 '>
									<svg className='w-4 h-4' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02c-.37-1.11-.56-2.3-.56-3.53c0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99C3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99"/></svg>
								</button>
								<button name='video-icon' className=' border border-slate-300/90 p-1 rounded-full hover:bg-slate-100 active:bg-slate-200 active:border-slate-300 '>
									<svg className='w-4 h-4' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M5 5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1.586l2.293 2.293A1 1 0 0 0 22 16V8a1 1 0 0 0-1.707-.707L18 9.586V8a3 3 0 0 0-3-3z" clipRule="evenodd"/></svg>
								</button>
								<label htmlFor='three-dot-icon' className='cursor-pointer border border-slate-300/90 p-0.5 rounded-full hover:bg-slate-100 active:bg-slate-200 active:border-slate-300 '>
									<svg className='w-5 h-5' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path fill="currentColor" d="M128 28a100 100 0 1 0 100 100A100.11 100.11 0 0 0 128 28m0 192a92 92 0 1 1 92-92a92.1 92.1 0 0 1-92 92m8-92a8 8 0 1 1-8-8a8 8 0 0 1 8 8m-44 0a8 8 0 1 1-8-8a8 8 0 0 1 8 8m88 0a8 8 0 1 1-8-8a8 8 0 0 1 8 8"/></svg>
								</label>
							</div>
						</div>

						<div name='middle-main' className="flex-1 overflow-y-scroll px-4 ">

							<ul className=' flex flex-col border border-slate-100 space-y-2'>
								{messages.map(message => message.sender.id === activeFriend.id ? (
									<li name='active-friend-section' key={message._id} className='
										max-w-[80%] mr-auto  
										flex gap-1 justify-start items-end 
									'>
										<img 
											src={message.sender.avatar} 
											alt='serder.avatar' 
											className='w-8 h-8 rounded-full '
										/>
										{message.message ? (
											<p className=' px-2 py-1 rounded-xl rounded-tl-none bg-slate-200 text-slate-700 '>{message.message}</p>
										) : (
											<img src={message.image} alt='uploaded add_image' 
												className='w-40 h-40 rounded-md border border-slate-200'
											/>
										)}
									</li>
								) : (
									<li ref={lastMessageRef} name='loged-in-user-section' key={message._id} className='
										max-w-[80%] ml-auto  
										flex gap-1 justify-end items-end
									' >
										{message.message ? (
											<p className=' px-2 py-1 rounded-xl rounded-br-none bg-blue-500 text-white '>{message.message}</p>
										) : (
											<img src={message.image} alt='uploaded add_image' 
												className='w-40 h-40 rounded-md border border-slate-200'
											/>
										)}
										<img 
											src={message.sender.avatar} 
											alt='serder.avatar' 
											className={`${false ? 'visible' : 'invisible'} w-4 h-4 rounded-full border border-blue-300`}
										/>
									</li>
								))}
							</ul>

						</div>


						{isTyping && (
							<div name='typing-indicator' className='ml-4 py-1'>
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="4" cy="12" r="3" fill="currentColor"><animate id="svgSpinners3DotsFade0" fill="freeze" attributeName="opacity" begin="0;svgSpinners3DotsFade1.end-0.25s" dur="0.75s" values="1;.2"/></circle><circle cx="12" cy="12" r="3" fill="currentColor" opacity=".4"><animate fill="freeze" attributeName="opacity" begin="svgSpinners3DotsFade0.begin+0.15s" dur="0.75s" values="1;.2"/></circle><circle cx="20" cy="12" r="3" fill="currentColor" opacity=".3"><animate id="svgSpinners3DotsFade1" fill="freeze" attributeName="opacity" begin="svgSpinners3DotsFade0.begin+0.3s" dur="0.75s" values="1;.2"/></circle></svg>
							</div>
						)}

						<div name='middle-bottom' className="px-4 border border-slate-200">
							<div className="flex items-center gap-2 py-1">
								<div name='add-attachment' className="relative flex">
									<input type="file" id='add-attachment' hidden />
									<label className='peer/add-attachment cursor-pointer' htmlFor='add-attachment'>
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"><circle cx="128" cy="128" r="112"/><path d="M 79.999992,128 H 176.0001"/><path d="m 128.00004,79.99995 v 96.0001"/></g></svg>
									</label>
									<label className='peer-hover/add-attachment:block absolute -top-6 left-0 whitespace-nowrap ' hidden > Add Attachment</label>
								</div>

								<div name='add-image' className="relative flex">
									<input onChange={imageChangeHandler} type="file" id='add-image' hidden accept='image/*' />
									<label className='peer/add-image cursor-pointer' htmlFor='add-image'>
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12c0-4.714 0-7.071 1.464-8.536C4.93 2 7.286 2 12 2c4.714 0 7.071 0 8.535 1.464C22 4.93 22 7.286 22 12c0 4.714 0 7.071-1.465 8.535C19.072 22 16.714 22 12 22s-7.071 0-8.536-1.465C2 19.072 2 16.714 2 12Z"/><circle cx="16" cy="8" r="2"/><path strokeLinecap="round" d="m2 12.5l1.752-1.533a2.3 2.3 0 0 1 3.14.105l4.29 4.29a2 2 0 0 0 2.564.222l.299-.21a3 3 0 0 1 3.731.225L21 18.5"/></g></svg>
									</label>
									<span className='peer-hover/add-image:block absolute -top-6 left-0 whitespace-nowrap' hidden > Add Image</span>
								</div>

								<div name='add-message' className="relative flex">
									<button className='peer/add-message'>
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M18 14h-7.5l2-2H18M6 14v-2.5l6.88-6.86c.19-.19.51-.19.71 0l1.76 1.77c.2.2.2.51 0 .71L8.47 14M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2"/></svg>
									</button>
									<span className='peer-hover/add-message:block absolute -top-6 left-0 whitespace-nowrap' hidden > Add Message</span>
								</div>

								<div name='add-gift' className="relative flex">
									<button className='peer/add-gift'>
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path fill="currentColor" d="M216 74h-41.26a46.41 46.41 0 0 0 6-4.48a27.56 27.56 0 0 0 9.22-20A30.63 30.63 0 0 0 158.5 18a27.56 27.56 0 0 0-20 9.22A57.1 57.1 0 0 0 128 45.76a57.1 57.1 0 0 0-10.48-18.53A27.56 27.56 0 0 0 97.5 18A30.63 30.63 0 0 0 66 49.51a27.56 27.56 0 0 0 9.22 20a45.74 45.74 0 0 0 6 4.48H40A14 14 0 0 0 26 88v32a14 14 0 0 0 14 14h2v66a14 14 0 0 0 14 14h144a14 14 0 0 0 14-14v-66h2a14 14 0 0 0 14-14V88a14 14 0 0 0-14-14m-80.23-11c2.25-12.12 6.29-21.75 11.69-27.85a15.68 15.68 0 0 1 11.4-5.15h.55A18.6 18.6 0 0 1 178 49.14a15.68 15.68 0 0 1-5.18 11.4c-10.72 9.46-28.9 12.29-38.48 13.11c.25-2.89.66-6.57 1.43-10.65M83.45 35.45A18.69 18.69 0 0 1 96.59 30h.55a15.68 15.68 0 0 1 11.4 5.18c9.46 10.72 12.29 28.9 13.11 38.48c-2.89-.25-6.57-.68-10.61-1.43c-12.12-2.23-21.75-6.29-27.85-11.7A15.64 15.64 0 0 1 78 49.14a18.65 18.65 0 0 1 5.45-13.69M38 120V88a2 2 0 0 1 2-2h82v36H40a2 2 0 0 1-2-2m16 80v-66h68v68H56a2 2 0 0 1-2-2m148 0a2 2 0 0 1-2 2h-66v-68h68Zm16-80a2 2 0 0 1-2 2h-82V86h82a2 2 0 0 1 2 2Z"/></svg>
									</button>
									<span className='peer-hover/add-gift:block absolute -top-6 left-0 whitespace-nowrap' hidden > Add Gift</span>
								</div>

								<div name='add-emoji' className="w-full relative flex items-center">
									<input ref={sendEmojiRef} type="checkbox" id='add-emoji' className='peer/add-emoji' hidden />
									<div className="rounded-md rounded-br-none hidden absolute -top-28 right-2 w-48 min-h-24 bg-slate-50 border border-slate-200 peer-checked/add-emoji:block ">
										<div className="grid grid-cols-7 gap-1 p-2">
											{emojies.map( emoji => ( <button key={emoji} onClick={emojiClickHandler(emoji)} className='
												hover:scale-110 border border-slate-100
											' >{emoji}</button>
											))}
										</div>
									</div>
									<input onKeyDown={sendMessageSubmitHandler} onChange={sendMessageChangeHandler} value={sendMessage} type='text' placeholder='Aa' className=' pl-4 pr-8 py-0.5 ml-1 rounded-md w-full border border-blue-300 focus:outline-none focus:border-blue-500 placeholder:text-sm text-slate-800 ' />
									<label htmlFor='add-emoji' className='cursor-pointer hover:text-yellow-500 active:text-yellow-600 absolute right-2 text-yellow-500/90'> &#128512; </label>

								</div>

								<button className='px-2 py-0.5 rounded-md border border-blue-400
								 text-blue-600
								 disabled:border-slate-300
								 disabled:text-slate-400
								 '
								 onClick={messageSendHandler}
								 > Send </button>

							</div>
						</div>
					</div>

				</div>

				<div name='right-panel' className='hidden col-span-4 peer-checked/dot:block border-l border-slate-200'>
					<div name='right-top' className='px-4 py-4 border-b border-slate-200'>
						<div className='flex flex-col items-center gap-1 '>
							<img src={ activeFriend.avatar || '/logo.png'} alt='avatar' className='rounded-full w-8 h-8' />
							{activeFriend.isActive && (
								<span className='text-green-700'>active</span>
							)}
							<span className='text-slate-800 font-medium'>{activeFriend.name}</span>
						</div>
					</div>

					<div name='right-main' className='px-4 py-2'>

						<div name="custom-chat">
							<input type="checkbox" id='arrow-bottom-icon' hidden className='peer/customize-chat' />
							<div className="py-1 flex justify-between items-start
									peer-checked/customize-chat:[&>label]:rotate-0
							">
								<span className="">Customize Chat</span>
								<label htmlFor='arrow-bottom-icon' className="cursor-pointer text-slate-600 border border-slate-200 rounded-full
									hover:bg-slate-50 hover:border-slate-300 
									hover:text-slate-700
									active:bg-slate-200/80 active:text-slate-800

									rotate-90 transition-transform
								">
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6l-6-6z"/></svg>
								</label>
							</div>

							<div className="border-t border-slate-400 scale-0 transition-transform
							peer-checked/customize-chat:scale-100
							">
								panel data
							</div>
						</div>

					</div>

				</div>

			</section>

		</main>
	)

}
export default Home
