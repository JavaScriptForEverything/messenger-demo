import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '../store/userSlice'

import Container from '@mui/material/Container'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import FingerprintIcon from '@mui/icons-material/Fingerprint'


const credentials = {
	email: { 
		label: 'Your Email', 
		placeholder: 'riajul@gmail.com', 
		type: 'email',
		adornment: {
			startIcon: <EmailIcon />,
			// endIcons: [<AlternateEmailIcon key='email-icon' />]
		}
	},
	password: { 
		label: 'Your Password', 
		placeholder: 'your password', 
		type: 'password',
		adornment: {
			startIcon: <LockIcon />,
			endIcons: [<FingerprintIcon key='password-icon' />]
		}
	},
}

const initialState = {}
Object.keys(credentials).forEach( field => initialState[field] = '')

const Login = () => {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { isAuthenticated } = useSelector(state => state.user)

	// const [ fields, setFields ] = useState(initialState)
	// const [ fieldsError, setFieldsError ] = useState(initialState)
	const [ visibles, setVisibles ] = useState({ password: true, confirmPassword: true })
	const [ fields, setFields ] = useState({
		email: 'riaz@gmail.com',
		password: 'asdfasdf'
	})


	useEffect(() => {
		if( isAuthenticated ) navigate('/')
	}, [isAuthenticated, navigate])


	const changeHandler = (name) => (evt) => {
		setFields({ ...fields, [name]: evt.target.value })
	}
	const iconClickHandler = (name) => () => {
		if(name === 'password') {
			setVisibles({ ...visibles, password: !visibles[name] })
		}
	}

	const submitHandler = async (evt) => {
		evt.preventDefault()

		dispatch(loginUser(fields))
	}
	return (
		<Container maxWidth='xs' sx={{ my: 2 }}>
			<Card xs={{ px: 2 }}>
				<CardContent>
					<Typography color='gray' variant='h5' align='center' paragraph>Login Page</Typography>
					<form noValidate onSubmit={submitHandler}>
						{Object.entries(credentials).map(([key, obj]) => (
							<TextField key={key} {...obj}
								sx= {{ mt: 2 }}
								type={obj.type === 'password' && visibles[key] ? obj.type : 'text'}
								InputLabelProps={{ shrink: true }}
								required
								fullWidth
								margin='dense'
								error={!fields[key]}
								helperText={!fields[key] && `Your ${key} is missing`}

								value={fields[key]}
								onChange={changeHandler(key)}

								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											{obj.adornment.startIcon} 
										</InputAdornment>
										),
									endAdornment: obj.adornment.endIcons ? (
										<InputAdornment position='end'>
											<IconButton color={visibles[key] ? 'default' : 'primary'} onClick={iconClickHandler(key)}>
												{obj.adornment.endIcons || ''} 
											</IconButton>
										</InputAdornment>
									) : ''
								}}
							/>
						) 
						
						)}
						<Button 
							sx={{ mt: 2 }}
							fullWidth
							type='submit'
							variant='contained'
							color='primary'
						>Login</Button>
					</form>

					<Typography align='center' sx={{ mt: 1 }}>
						<Typography component='span' sx={{ pr: 1 }} variant='body2' >
							Don't have an account? 
						</Typography>
						<Typography component='span' color='blue' variant='body2' >
							<Link to='/messenger/register'> Register </Link>
						</Typography>
					</Typography>

				</CardContent>
			</Card>
		</Container>
	)
}
export default Login
