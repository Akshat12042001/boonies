import {StyleSheet} from 'react-native';
import {COLORS} from '../../../constants';

export default StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.HEADER_BORDER,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: COLORS.LOGIN_PRIMARY,
    borderRadius: 9,
    minWidth: 18,
    paddingHorizontal: 4,
    paddingVertical: 1,
    position: 'absolute',
    right: -4,
    top: -4,
  },
  badgeText: {
    color: COLORS.WHITE,
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 12,
  },
});
