import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

CustomBox.propTypes = {
  children: PropTypes.node,
  customStyle: PropTypes.object
};
export default function CustomBox({ children, customStyle }) {
  const theme = useTheme();

  return (
    <Box sx={theme?.customBox?.box_container} style={customStyle}>
      {children}
    </Box>
  );
}
