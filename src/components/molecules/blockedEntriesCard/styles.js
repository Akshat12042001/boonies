import {StyleSheet} from 'react-native';
import {COLORS} from '../../../constants';

export default StyleSheet.create({
  card: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 14,
  },
  row: {
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  rowLast: {
    marginBottom: 0,
  },
  badge: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 6,
    marginRight: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rangeText: {
    flex: 1,
  },
  deleteButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    marginLeft: 8,
    width: 32,
  },
});
