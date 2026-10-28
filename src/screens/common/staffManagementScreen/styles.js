import {StyleSheet} from 'react-native';
import {COLORS, FONTS} from '../../../constants';

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  headerIconButton: {
    alignItems: 'center',
    backgroundColor: COLORS.HEADER_BORDER,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 14,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF4EF',
    marginRight: 12,
  },
  summaryCopy: {
    flex: 1,
    minWidth: 0,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6EBE7',
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 14,
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
  listContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  separator: {
    height: 12,
  },
  empty: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  skeleton: {
    paddingTop: 4,
  },
  footer: {
    paddingVertical: 16,
  },
});
