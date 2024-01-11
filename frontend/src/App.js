import { Routes, Route, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import { getUserById } from './store/userSlice'
import Login from './pages/login'
import Register from './pages/register'
import Home from './pages/home'
import Demo from './pages/demo'
import ProtectRoute from './components/protectRoute'


const App = ({ socket }) => {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { token } = useSelector(state => state.user)

	useEffect(() => {
		if(!token) return navigate('/messenger/login')
		const { id } = jwtDecode(token)
		dispatch(getUserById(id))
	}, [token, dispatch, navigate])


	return (
		<>
			<Routes>
				<Route path='/messenger/register' Component={Register} />
				<Route path='/messenger/login' Component={Login} />
				<Route path='/' element={<Home socket={socket} />} />
				<Route path='/demo' Component={Demo} />
			</Routes>
		
			
		</>
	)
}
export default App
