import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
// @mui
import { useTheme, styled } from '@mui/material/styles';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
// utils
import { IMAGES_FOR_EACH_LEVEL, instructionsForEachLevel } from '../../../utils/constants';
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

export default function AppLevelCard({ title, subheader, levelData, ...other }) {
  console.log('levelData', levelData);
  const instructions = instructionsForEachLevel(levelData);
  console.log('instructions', instructions);
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />
      <CardContent>
        <CircleImage src={IMAGES_FOR_EACH_LEVEL[levelData?.level]?.image} alt="Profile" />
        <Instructions>
          <Typography variant="h6" align="left">
            Instructions
          </Typography>
          <Typography variant="body1" align="left">
            To advance to the next level and earn a reward, you must complete the following tasks:
          </Typography>
          <Typography variant="body1" align="left">
            1. {instructions?.task1}
          </Typography>
          <Typography variant="body1" align="left">
            2. {instructions?.task2}
          </Typography>
        </Instructions>
      </CardContent>
    </Card>
  );
}
