import {StyleSheet} from 'react-native';
import {COLORS} from '../../../constants';

export default StyleSheet.create({
  card: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.INVOICE_AVATAR_BACKGROUND,
    marginRight: 12,
  },
  cardMain: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flexShrink: 1,
  },
  statusBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusActive: {
    backgroundColor: '#EDF4EF',
    borderColor: '#B7D4BE',
  },
  statusInactive: {
    backgroundColor: '#F5F6F9',
    borderColor: COLORS.BORDER,
  },
  statusPending: {
    backgroundColor: '#FFFBF0',
    borderColor: '#E0B84A',
  },
  detailRow: {
    marginTop: 6,
  },
  actionsFooter: {
    alignItems: 'center',
    borderTopColor: COLORS.BORDER_LIGHT,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 12,
    paddingTop: 12,
  },
  menuButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F6F5',
  },
  popoverBackdrop: {
    backgroundColor: 'transparent',
  },
  popover: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    elevation: 8,
    paddingVertical: 6,
    shadowColor: COLORS.INVOICE_SHADOW,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  menuList: {
    minWidth: 160,
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    width: 22,
  },
});
