// component
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const navConfig = (userData) => {
  console.log('userData', userData);
  return {
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
          title: 'token Requests',
          path: `/tokenRequests`,
          icon: icon('ic_request_token'),
        },
        // {
        //   title: 'product',
        //   path: '/products',
        //   icon: icon('ic_cart'),
        // },
      ],
      member: [
        {
          title: 'dashboard',
          path: '/dashboard',
          icon: icon('ic_analytics'),
        },
        {
          title: 'token Requests',
          path: `/tokenRequests/${userData?.id}`,
          icon: icon('ic_request_token'),
        },
        // {
        //   title: 'product',
        //   path: '/products',
        //   icon: icon('ic_cart'),
        // },
      ],
    },
  };
};

export default navConfig;
