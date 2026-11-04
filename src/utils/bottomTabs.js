import {NAVIGATION} from '../constants';
import {hasStaffModule, isStaffUser, STAFF_MODULE} from './staff';

export const BOTTOM_TAB_CONFIG = [
  {
    name: NAVIGATION.TABS.HOME_SCREEN,
    title: 'TABS.HOME',
  },
  {
    name: NAVIGATION.TABS.BOOKING_SCREEN,
    title: 'TABS.BOOKING',
    modules: [STAFF_MODULE.CALENDAR, STAFF_MODULE.DIRECT_BOOKINGS],
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
  if (
    Array.isArray(tab.modules) &&
    tab.modules.length > 0 &&
    !tab.modules.some(moduleId => hasStaffModule(user, moduleId))
  ) {
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
