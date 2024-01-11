import { Outlet } from 'react-router-dom'

const ProtectRoute = ({ children }) => {
	const isAuthenticated = true


	return (
		<>
		{
			isAuthenticated ? 
			<Outlet /> 
			: <p>Not</p>
		}
		</>
	)
}
export default ProtectRoute
