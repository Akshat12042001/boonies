import {StyleSheet} from 'react-native';
import {COLORS, FONTS} from '../../../constants';

export default StyleSheet.create({
  card: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statusBadge: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: COLORS.GREYSCALE_100,
    borderRadius: 999,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  guestRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 14,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: COLORS.INVOICE_AVATAR_BACKGROUND,
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    marginRight: 12,
    width: 44,
  },
  guestCopy: {
    flex: 1,
  },
  guestEmail: {
    marginTop: 2,
  },
  stayRow: {
    alignItems: 'center',
    backgroundColor: COLORS.GREYSCALE_100,
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  staySide: {
    flex: 1,
  },
  staySideEnd: {
    alignItems: 'flex-end',
  },
  stayLabel: {
    marginBottom: 4,
  },
  stayNights: {
    marginHorizontal: 8,
  },
  metaRow: {
    alignItems: 'center',
    borderBottomColor: COLORS.BORDER_LIGHT,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  metaRowLast: {
    borderBottomWidth: 0,
    marginBottom: 4,
  },
  viewButton: {
    borderRadius: 12,
    marginTop: 8,
    minHeight: 48,
  },
  initials: {
    color: COLORS.INVOICE_AVATAR_TEXT,
    fontFamily: FONTS.semiBold,
    fontSize: 14,
  },
});
