// component
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const navConfig = (userData) => {
  return {
    sidebarLinks: {
      admin: [
        {
          title: 'dashboard',
          path: '/dashboard',
          icon: icon('ic_analytics'),
        },
        {
          title: 'Investors',
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
        {
          title: 'Links',
          path: `/receivedLinks`,
          icon: icon('ic_links'),
        },
        {
          title: 'Cycles',
          path: `/cycles`,
          icon: icon('ic_cycle'),
        },
        {
          title: 'Transactions',
          path: `/transactions`,
          icon: icon('ic_transaction'),
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
          title: 'Investors',
          path: '/members',
          icon: icon('ic_user'),
        },
        {
          title: 'token Requests',
          path: `/tokenRequests/${userData?.id}`,
          icon: icon('ic_request_token'),
        },
        {
          title: 'Links',
          path: `/userLinks`,
          icon: icon('ic_links'),
        },
        {
          title: 'Transactions',
          path: `/employeeTransactions`,
          icon: icon('ic_transaction'),
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
