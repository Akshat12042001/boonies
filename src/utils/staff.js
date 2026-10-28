import {
  BrushIcon,
  BuildingIcon,
  CalendarIcon,
  MenuIcon,
  ReceiptIcon,
  UserPlusIcon,
} from '../components/svgs';

export const STAFF_PERMISSION_OPTIONS = [
  {
    id: 'logo',
    titleKey: 'STAFF.INVITE.PERMISSION_LOGO_TITLE',
    descriptionKey: 'STAFF.INVITE.PERMISSION_LOGO_DESC',
    Icon: BrushIcon,
    color: '#6B4EAA',
    background: '#F0EBFA',
  },
  {
    id: 'food_menu',
    titleKey: 'STAFF.INVITE.PERMISSION_MENU_TITLE',
    descriptionKey: 'STAFF.INVITE.PERMISSION_MENU_DESC',
    Icon: MenuIcon,
    color: '#397D2D',
    background: '#EDF4EF',
  },
  {
    id: 'bills',
    titleKey: 'STAFF.INVITE.PERMISSION_BILLS_TITLE',
    descriptionKey: 'STAFF.INVITE.PERMISSION_BILLS_DESC',
    Icon: ReceiptIcon,
    color: '#E07A4F',
    background: '#FDEFEA',
  },
  {
    id: 'direct_bookings',
    titleKey: 'STAFF.INVITE.PERMISSION_BOOKINGS_TITLE',
    descriptionKey: 'STAFF.INVITE.PERMISSION_BOOKINGS_DESC',
    Icon: UserPlusIcon,
    color: '#2F6FED',
    background: '#EAF1FF',
  },
  {
    id: 'listings',
    titleKey: 'STAFF.INVITE.PERMISSION_LISTINGS_TITLE',
    descriptionKey: 'STAFF.INVITE.PERMISSION_LISTINGS_DESC',
    Icon: BuildingIcon,
    color: '#2F6FED',
    background: '#EAF1FF',
  },
  {
    id: 'calendar',
    titleKey: 'STAFF.INVITE.PERMISSION_CALENDAR_TITLE',
    descriptionKey: 'STAFF.INVITE.PERMISSION_CALENDAR_DESC',
    Icon: CalendarIcon,
    color: '#397D2D',
    background: '#EDF4EF',
  },
];

export const EMPTY_STAFF_FORM_VALUES = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  permissions: STAFF_PERMISSION_OPTIONS.reduce((acc, option) => {
    acc[option.id] = false;
    return acc;
  }, {}),
};

export const STAFF_MODULE = {
  LOGO: 'logo',
  FOOD_MENU: 'food_menu',
  BILLS: 'bills',
  DIRECT_BOOKINGS: 'direct_bookings',
  LISTINGS: 'listings',
  CALENDAR: 'calendar',
};

export const isStaffUser = user => {
  const type = String(user?.userType || user?.role || '').toLowerCase();
  return type === 'staff';
};

export const getEnabledModules = user => {
  if (!isStaffUser(user)) {
    return null;
  }

  return new Set(
    Array.isArray(user?.enabledModules) ? user.enabledModules : [],
  );
};

export const hasStaffModule = (user, moduleId) => {
  const enabledModules = getEnabledModules(user);
  if (enabledModules === null) {
    return true;
  }
  return enabledModules.has(moduleId);
};

export const hasAnyStaffModule = (user, moduleIds = []) =>
  moduleIds.some(moduleId => hasStaffModule(user, moduleId));

export const chunkPairs = (items = []) => {
  const rows = [];
  for (let index = 0; index < items.length; index += 2) {
    rows.push(items.slice(index, index + 2));
  }
  return rows;
};

export const permissionsToObject = (permissions = []) => {
  const enabledIds = Array.isArray(permissions)
    ? permissions
    : Object.entries(permissions || {})
        .filter(([, enabled]) => Boolean(enabled))
        .map(([id]) => id);

  const enabledSet = new Set(enabledIds);

  return STAFF_PERMISSION_OPTIONS.reduce((acc, option) => {
    acc[option.id] = enabledSet.has(option.id);
    return acc;
  }, {});
};

export const permissionsToArray = (permissions = {}) =>
  STAFF_PERMISSION_OPTIONS.filter(option => Boolean(permissions?.[option.id])).map(
    option => option.id,
  );

export const buildStaffFormValues = (member = {}) => ({
  firstName: String(member?.firstName || '').trim(),
  lastName: String(member?.lastName || '').trim(),
  email: String(member?.email || '').trim(),
  phone: String(member?.phone || '')
    .replace(/[^\d]/g, '')
    .slice(0, 10),
  permissions: permissionsToObject(
    member?.permissions || member?.enabledModules,
  ),
});

export const buildCreateStaffMemberPayload = values => {
  const payload = {
    firstName: String(values?.firstName || '').trim(),
    lastName: String(values?.lastName || '').trim(),
    email: String(values?.email || '').trim(),
    permissions: permissionsToArray(values?.permissions),
  };

  const phone = String(values?.phone || '')
    .replace(/[^\d]/g, '')
    .slice(0, 10);
  if (phone) {
    payload.phone = phone;
  }

  return payload;
};

export const buildUpdateStaffMemberPayload = values => ({
  firstName: String(values?.firstName || '').trim(),
  lastName: String(values?.lastName || '').trim(),
  email: String(values?.email || '').trim(),
  phone: String(values?.phone || '')
    .replace(/[^\d]/g, '')
    .slice(0, 10),
  permissions: permissionsToArray(values?.permissions),
});
