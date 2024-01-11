import { useState } from 'react'

import Container from '@mui/material/Container'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'

import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
// import AlternateEmailIcon from '@mui/icons-material/AlternateEmail'
import FingerprintIcon from '@mui/icons-material/Fingerprint'
import ClearIcon from '@mui/icons-material/Clear'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { registerUser } from '../store/userSlice'


const credentials = {
	name: { 
		label: 'Your Name', 
		placeholder: 'riajul islam', 
		type: 'text',
		adornment: {
			startIcon: <PersonIcon />,
			// endIcons: [<PersonIcon key='user-icon' />]
		}
	},
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
	confirmPassword: { 
		label: 'Confirm Password', 
		placeholder: 'same password again', 
		type: 'password',
		adornment: {
			startIcon: <LockIcon />,
			endIcons: [<FingerprintIcon key='confirmPassword-icon' />]
		}
	},
	avatar: { 
		label: 'Your Photo', 
		type: 'file',
		adornment: {
			startIcon: <Avatar />,
			endIcons: [<ClearIcon key='avatar-icon' />]
		}
	},
}

const initialState = {}
Object.keys(credentials).forEach( field => initialState[field] = '')

const Register = () => {
	const dispatch = useDispatch()

	const [ fields, setFields ] = useState(initialState)
	const [ fieldsError, setFieldsError ] = useState(initialState)
	const [ visibles, setVisibles ] = useState({ password: true, confirmPassword: true })

	const changeHandler = (name) => (evt) => {
		if(name === 'avatar') {
			if(!evt.target.files.length) return

			const file = evt.target.files[0]
			if( !file.type.match('image/*') ) return setFieldsError({ ...fieldsError, avatar : 'please select image' })

			const reader = new FileReader()
			reader.readAsDataURL( file )
			reader.addEventListener('loadend', () => {
				setFields({ ...fields, [name]: reader.result })
			})

			return
		}
		setFields({ ...fields, [name]: evt.target.value })
	}
	const iconClickHandler = (name) => () => {
		if(name === 'avatar') {
			setFields({ ...fields, avatar: '' })
		}
		if(name === 'password') {
			setVisibles({ ...visibles, password: !visibles[name] })
		}
		if(name === 'confirmPassword') {
			setVisibles({ ...visibles, confirmPassword: !visibles[name] })
		}
	}

	const submitHandler = async (evt) => {
		evt.preventDefault()
		// test fields validation
		// console.log(fields)
		// console.log({ ...fields, avatar: image })

		// const formData = new FormData()
		// Object.entries(fields).forEach(([key, value]) => {
		// 	formData.append(key, value)
		// })


		// dispatch(registerUser(formData))
		dispatch(registerUser(fields))
	}
	return (
		<Container maxWidth='xs' sx={{ my: 2 }}>
			<Card xs={{ px: 2 }}>
				<CardContent>
					<Typography color='gray' variant='h5' align='center' paragraph>Login Page</Typography>
					<form noValidate onSubmit={submitHandler}>
						{Object.entries(credentials).map(([key, obj]) => key !== 'avatar' ? (
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

						) : (
							<TextField key={key} {...obj}
								sx= {{ mt: 2 }}
								InputLabelProps={{ shrink: true }}
								required
								fullWidth
								margin='dense'
								error={!fields[key]}
								helperText={!fields[key] && `Your ${key} is missing`}

								// value={fields[key]} 		// Don't set value for type=file
								onChange={changeHandler(key)}

								InputProps={{
									inputProps: {
										accept: 'image/*'
									},
									startAdornment: (
										<InputAdornment position='start'>
											<Avatar src={fields[key]} />
										</InputAdornment>
										),
									endAdornment: (
										<InputAdornment position='end'>
											<IconButton color={visibles[key] ? 'default' : 'primary'} onClick={iconClickHandler(key)}>
												{obj.adornment.endIcons || ''} 
											</IconButton>
										</InputAdornment>
									)
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
						>Register</Button>
					</form>

					<Typography align='center' sx={{ mt: 1 }}>
						<Typography component='span' sx={{ pr: 1 }} variant='body2' >
							Already have an account? 
						</Typography>
						<Typography component='span' color='blue' variant='body2' >
							<Link to='/messenger/login'> Login </Link>
						</Typography>
					</Typography>

				</CardContent>
			</Card>
		</Container>
	)
}
export default Register
