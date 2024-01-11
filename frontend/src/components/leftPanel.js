import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'

import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import EditIcon from '@mui/icons-material/Edit'

const LeftPanel = () => {

	return (
		<Box sx={{ width: '100%', height: '100%', border: '1px solid red' }}>
			<Box sx={{ display: 'flex',  justifyContent: 'space-between' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
					<Avatar />
					<Typography> Riajul </Typography>
				</Box>

				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
					<IconButton> <MoreHorizIcon /> </IconButton>
					<IconButton> <EditIcon /> </IconButton>
				</Box>
			</Box>
		</Box>
	)
}
export default LeftPanel
