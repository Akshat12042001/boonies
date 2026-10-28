import {StyleSheet} from 'react-native';
import {COLORS, FONTS} from '../../../constants';

export default StyleSheet.create({
  screen: {
    backgroundColor: COLORS.BACKGROUND,
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.PRIMARY_DARK,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.LOGIN_PRIMARY,
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: COLORS.SURFACE,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F6F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6EBE7',
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.TEXT,
    paddingVertical: 0,
  },
  list: {
    flex: 1,
    backgroundColor: COLORS.SURFACE,
  },
  listContent: {
    backgroundColor: COLORS.SURFACE,
    flexGrow: 1,
    paddingBottom: 120,
  },
  skeleton: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.SURFACE,
  },
  rowUnread: {
    backgroundColor: '#F3F5F4',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.INVOICE_AVATAR_BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flex: 1,
    minWidth: 0,
  },
  time: {
    flexShrink: 0,
  },
  homestay: {
    marginTop: 2,
  },
  bottomRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  preview: {
    flex: 1,
    minWidth: 0,
  },
  unreadCountBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.LOGIN_PRIMARY,
    flexShrink: 0,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E6EBE7',
    marginLeft: 80,
  },
  separatorUnread: {
    marginLeft: 0,
    backgroundColor: '#E6EBE7',
  },
  empty: {
    paddingTop: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  footer: {
    paddingVertical: 16,
  },
});
