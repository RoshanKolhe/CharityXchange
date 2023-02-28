import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
// @mui
import { useTheme, styled } from '@mui/material/styles';
import { Card, CardHeader } from '@mui/material';
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

export default function AppLevelCard({ title, subheader, chartColors, chartData, ...other }) {
  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />
      
    </Card>
  );
}
