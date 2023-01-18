import { Suspense } from 'react';
// routes
import Router from './routes/routes';
// theme
import ThemeProvider from './theme';
// components
import ScrollToTop from './components/scroll-to-top';
import { StyledChart } from './components/chart';
import history from './helpers/history';

// ----------------------------------------------------------------------

export default function App() {
  // localStorage.setItem('isAuthenticated', false);
  const role = localStorage.getItem('role');
  return (
    <ThemeProvider>
      <ScrollToTop />
      <StyledChart />
      <Suspense fallback={<div>Loading...</div>}>
        <Router  role={role} history={history} navigator={history} />
      </Suspense>
    </ThemeProvider>
  );
}
