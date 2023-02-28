import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
// @mui
import { useTheme, styled } from '@mui/material/styles';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
// utils
import { fNumber } from '../../../utils/formatNumber';
// components
import { useChart } from '../../../components/chart';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

AppLevelCard.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
};
const CircleImage = styled('img')({
  display: 'block',
  margin: '0 auto',
  borderRadius: '50%',
  width: 150,
  height: 150,
});
const Instructions = styled('div')({
  marginTop: 20,
});

export default function AppLevelCard({ title, subheader, chartColors, chartData, ...other }) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />
      <CardContent>
        <CircleImage src="https://via.placeholder.com/150x150.png" alt="Profile" />
        <Instructions>
          <Typography variant="h6" align="left">
            Instructions
          </Typography>
          <Typography variant="body1" align="left">
            Complete the following tasks to progress to Next Level:
          </Typography>
          <Typography variant="body1" align="left">
            1. Task 1
          </Typography>
          <Typography variant="body1" align="left">
            2. Task 2
          </Typography>
          <Typography variant="body1" align="left">
            3. Task 3
          </Typography>
        </Instructions>
      </CardContent>
    </Card>
  );
}
