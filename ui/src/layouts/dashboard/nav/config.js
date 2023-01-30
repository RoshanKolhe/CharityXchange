// component
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const navConfig = {
  sidebarLinks: {
    admin: [
      {
        title: 'dashboard',
        path: '/dashboard',
        icon: icon('ic_analytics'),
      },
      {
        title: 'members',
        path: '/members',
        icon: icon('ic_user'),
      },
      {
        title: 'Pending KYC',
        path: '/pendingKyc',
        icon: icon('account-check'),
      },
      {
        title: 'product',
        path: '/products',
        icon: icon('ic_cart'),
      },
    ],
    member: [
      {
        title: 'dashboard',
        path: '/dashboard',
        icon: icon('ic_analytics'),
      },
      {
        title: 'product',
        path: '/products',
        icon: icon('ic_cart'),
      },
    ],
  },
};

export default navConfig;
