import {BrushIcon, EmailIcon, TrashIcon} from '../../svgs';

export const STAFF_MENU_ACTION = {
  RESEND: 'resend',
  EDIT: 'edit',
  DELETE: 'delete',
};

export const STAFF_MENU_ITEMS = [
  {
    action: STAFF_MENU_ACTION.EDIT,
    labelKey: 'STAFF.MENU_EDIT',
    Icon: BrushIcon,
  },
  {
    action: STAFF_MENU_ACTION.DELETE,
    labelKey: 'STAFF.MENU_DELETE',
    Icon: TrashIcon,
    destructive: true,
  },
];

export const STAFF_PENDING_MENU_ITEMS = [
  {
    action: STAFF_MENU_ACTION.RESEND,
    labelKey: 'STAFF.MENU_RESEND',
    Icon: EmailIcon,
  },
  ...STAFF_MENU_ITEMS,
];
