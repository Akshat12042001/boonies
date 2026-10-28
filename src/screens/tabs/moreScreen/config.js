import {
  CalendarIcon,
  LogoutIcon,
  ShopIcon,
  SupportIcon,
  DealIcon,
  PropertyIcon,
  StaffIcon,
} from '../../../components/svgs';
import {COLORS} from '../../../constants';
import {STAFF_MODULE} from '../../../utils/staff';

const DATA = [
  {
    id: 1,
    title: 'Bookings',
    icon: <CalendarIcon color={COLORS.PRIMARY} />,
    modules: [STAFF_MODULE.CALENDAR, STAFF_MODULE.DIRECT_BOOKINGS],
  },
  {
    id: 2,
    title: 'Support',
    icon: <SupportIcon color={COLORS.PRIMARY} size={20} />,
  },
  {
    id: 4,
    title: 'Shop',
    icon: <ShopIcon color={COLORS.PRIMARY} size={20} />,
    hostOnly: true,
  },
  {
    id: 5,
    title: 'Deals',
    icon: <DealIcon color={COLORS.PRIMARY} size={20} />,
    hostOnly: true,
  },
  {
    id: 6,
    title: 'Properties',
    icon: <PropertyIcon color={COLORS.PRIMARY} size={20} />,
    modules: [STAFF_MODULE.LISTINGS],
  },
  {
    id: 7,
    title: 'Staff Management',
    icon: <StaffIcon color={COLORS.PRIMARY} size={20} />,
    hostOnly: true,
  },
  {
    id: 3,
    title: 'Logout',
    icon: <LogoutIcon color={COLORS.RED_ERROR} size={20} />,
  },
];

export default DATA;
