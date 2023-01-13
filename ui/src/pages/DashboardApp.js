// material
import { Container, Typography, Grid } from '@mui/material';
// components
import Page from '../components/Page';
// import EcommerceShop from './Products';

// ----------------------------------------------------------------------

export default function DashboardApp() {
  return (
    <Page title="Welcome">
      <Container maxWidth="xl" id="dashboardContainer">
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          style={{ minHeight: '100vh' }}
        >
          <Typography variant="h3"> Welcome to Nexus</Typography>
        </Grid>
      </Container>
    </Page>
  );
}
