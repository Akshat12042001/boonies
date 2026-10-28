import {NAVIGATION} from '../constants';
import {hasStaffModule, isStaffUser, STAFF_MODULE} from './staff';

export const BOTTOM_TAB_CONFIG = [
  {
    name: NAVIGATION.TABS.HOME_SCREEN,
    title: 'TABS.HOME',
  },
  {
    name: NAVIGATION.TABS.MENU_SCREEN,
    title: 'TABS.MENU',
    module: STAFF_MODULE.FOOD_MENU,
  },
  {
    name: NAVIGATION.TABS.INVOICES_SCREEN,
    title: 'TABS.INVOICES',
    module: STAFF_MODULE.BILLS,
  },
  {
    name: NAVIGATION.TABS.MESSAGES_SCREEN,
    title: 'TABS.MESSAGES',
    hideForStaff: true,
  },
  {
    name: NAVIGATION.TABS.MORE_SCREEN,
    title: 'TABS.MORE',
  },
];

export const isBottomTabVisible = (user, tab) => {
  if (tab.hideForStaff && isStaffUser(user)) {
    return false;
  }
  if (tab.module && !hasStaffModule(user, tab.module)) {
    return false;
  }
  return true;
};

export const getVisibleBottomTabs = user =>
  BOTTOM_TAB_CONFIG.filter(tab => isBottomTabVisible(user, tab));

export const getBottomTabsNavigatorKey = user => {
  if (!isStaffUser(user)) {
    return 'host-tabs';
  }

  const modules = Array.isArray(user?.enabledModules)
    ? [...user.enabledModules].sort().join('|')
    : '';
  return `staff-tabs:${modules}`;
};
