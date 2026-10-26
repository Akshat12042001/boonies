import {StyleSheet} from 'react-native';
import {COLORS} from '../../../constants';

export default StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  row: {
    alignItems: 'stretch',
    flexDirection: 'row',
  },
  rowSpacing: {
    marginTop: 8,
  },
  card: {
    alignItems: 'center',
    backgroundColor: COLORS.SURFACE,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    shadowColor: '#152B1A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardSpacing: {
    marginLeft: 8,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 8,
    height: 28,
    justifyContent: 'center',
    marginBottom: 6,
    width: 28,
  },
  label: {
    marginBottom: 2,
  },
  value: {
    marginBottom: 1,
  },
  filters: {
    backgroundColor: COLORS.SURFACE,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchField: {
    marginBottom: 0,
  },
  dateRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  dateField: {
    flex: 1,
    marginBottom: 0,
  },
  dateFieldSpacing: {
    marginLeft: 10,
  },
  dealCard: {
    marginTop: 12,
  },
  empty: {
    marginTop: 20,
  },
  statBone: {
    backgroundColor: COLORS.SKELETON_BONE,
    borderRadius: 12,
    flex: 1,
    height: 92,
  },
  filterBone: {
    backgroundColor: COLORS.SKELETON_BONE,
    borderRadius: 12,
    height: 148,
    marginTop: 8,
  },
  dealBone: {
    backgroundColor: COLORS.SKELETON_BONE,
    borderRadius: 16,
    height: 108,
    marginTop: 12,
  },
  paginationLoader: {
    paddingVertical: 16,
  },
});
