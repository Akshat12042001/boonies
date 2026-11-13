import {StyleSheet} from 'react-native';
import {COLORS} from '../../../constants';

export default StyleSheet.create({
  card: {
    backgroundColor: '#F7FBF7',
    borderColor: COLORS.PRIMARY,
    borderRadius: 18,
    borderWidth: 1.5,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    marginBottom: 6,
  },
  description: {
    lineHeight: 20,
    marginBottom: 10,
  },
  clearLink: {
    alignSelf: 'flex-start',
    marginBottom: 4,
    marginTop: 2,
  },
  rangeHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  availableBadge: {
    alignItems: 'center',
    borderColor: COLORS.LOGIN_PRIMARY,
    borderRadius: 999,
    borderWidth: 1.5,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  availableLabel: {
    marginLeft: 6,
  },
  rangeTitle: {
    marginBottom: 12,
  },
  reasonInput: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER,
    borderRadius: 12,
    borderWidth: 1,
    color: COLORS.TEXT,
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  primaryButton: {
    borderRadius: 12,
    marginBottom: 10,
    minHeight: 48,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.LOGIN_PRIMARY,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    marginBottom: 4,
    minHeight: 48,
  },
  divider: {
    backgroundColor: COLORS.BORDER_LIGHT,
    height: 1,
    marginBottom: 12,
    marginTop: 14,
  },
  priceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
