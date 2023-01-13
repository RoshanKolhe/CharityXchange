import { Icon } from '@iconify/react';
import pieChart2Fill from '@iconify/icons-eva/pie-chart-2-fill';

// ----------------------------------------------------------------------

const getIcon = (name) => <Icon icon={name} width={22} height={22} />;

const sidebarConfig = [
  {
    title: 'Companies',
    path: '/dashboard/company',
    icon: getIcon(pieChart2Fill)
  },
  {
    title: 'Users',
    path: '/dashboard/users',
    icon: getIcon(pieChart2Fill)
  }
];

export default sidebarConfig;
