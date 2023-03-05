/* eslint-disable camelcase */
import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import { forwardRef } from 'react';

export function useUserRoles() {
  const permissions = localStorage.getItem('permissions').split(',');

  return permissions;
}

export const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
};

export const convertData = (data) => {
  const roots = data.filter((item) => !data.some((x) => x.id === item.parent_id));
  // Build the tree
  function buildTree(data, parent_id) {
    const branch = [];
    data.forEach((item) => {
      if (item.parent_id === parent_id) {
        const children = buildTree(data, item.id);
        if (children.length) {
          item.children = children;
        }
        branch.push(item);
      }
    });
    return branch;
  }

  // Build the result object
  const result = roots.map((root) => {
    const children = buildTree(data, root.id);
    if (children.length) {
      root.children = children;
    }
    return root;
  });

  console.log(result[0]);
  return result[0];
};

export const LEVEL_DATA = {
  LEVEL_1: 'Assistance Executive',
  LEVEL_2: 'Executive',
  LEVEL_3: 'Senior Executive',
  LEVEL_4: 'Royal Executive',
  LEVEL_5: 'Crown Executive',
  LEVEL_6: 'Global Executive',
};

export const LOCK_PRICE = {
  3: 30,
  5: 60,
  11: 150,
};

export const IMAGES_FOR_EACH_LEVEL = {
  LEVEL_1: {
    image: '/assets/levelImages/1.png',
  },
  LEVEL_2: {
    image: '/assets/levelImages/2.png',
  },
  LEVEL_3: {
    image: '/assets/levelImages/3.png',
  },
  LEVEL_4: {
    image: '/assets/levelImages/4.png',
  },
  LEVEL_5: {
    image: '/assets/levelImages/5.png',
  },
  LEVEL_6: {
    image: '/assets/levelImages/6.png',
  },
};

export const instructionsForEachLevel = (userLevel) => {
  if (userLevel?.level === 'LEVEL_1') {
    return {
      task1: `Achieve Direct Users ${userLevel?.directUserCount}/4`,
      task2: `Activate Team Links ${userLevel?.teamActiveLinkCount}/200`,
    };
  }
  if (userLevel?.level === 'LEVEL_2') {
    return {
      task1: `Achieve Direct Users ${userLevel?.directUserCount}/6`,
      task2: `Team Link Activated ${userLevel?.teamActiveLinkCount}/400`,
    };
  }
  if (userLevel?.level === 'LEVEL_3') {
    return {
      task1: `Achieve Direct Users ${userLevel?.directUserCount}/8`,
      task2: `Team Link Activated ${userLevel?.teamActiveLinkCount}/1000`,
    };
  }
  if (userLevel?.level === 'LEVEL_4') {
    return {
      task1: `Achieve Direct Users ${userLevel?.directUserCount}/6`,
      task2: `Team Link Activated ${userLevel?.teamActiveLinkCount}/400`,
    };
  }
  if (userLevel?.level === 'LEVEL_5') {
    return {
      task1: `Achieve Direct Users ${userLevel?.directUserCount}/16`,
      task2: `Team Link Activated ${userLevel?.teamActiveLinkCount}/2500`,
    };
  }
  return {
    task1: `Achieve Direct Users ${userLevel?.directUserCount}/3`,
    task2: `Team Link Activated ${userLevel?.teamActiveLinkCount}`,
  };
};
