import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'

import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import CallIcon from '@mui/icons-material/Call'
import VideocamIcon from '@mui/icons-material/Videocam'

const styles = {
	// width: '100%'
}

const MessageSection = () => {

	return (
		<>
			<input type='checkbox' id='middle-icon' hidden/>
			<Box id='middle-container' style={styles} sx={{ width: '70%', height: '100%', border: '1px solid red' }}>
				<Box sx={{ display: 'flex',  justifyContent: 'space-between' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<Avatar />
						<Typography> Riajul </Typography>
					</Box>

					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<IconButton> <CallIcon /> </IconButton>
						<IconButton> <VideocamIcon /> </IconButton>
							<IconButton> 
						<label htmlFor='middle-icon'>
								<MoreHorizIcon /> 
						</label>
							</IconButton>
					</Box>
				</Box>
			</Box>

			<Box sx={{ width: '30%', height: '100%', border: '1px solid red' }}>
				<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
					<Avatar />
					<Typography> Active </Typography>
					<Typography> Riajul </Typography>
				</Box>

			</Box>
		</>
	)
}
export default MessageSection
