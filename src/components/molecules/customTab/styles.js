import {StyleSheet} from 'react-native';
import {COLORS} from '../../../constants';

export default StyleSheet.create({
  /** Row inside the pill — equal-width tabs */
  tabRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
  },
  tabHit: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    minHeight: 48,
  },
  tabColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconWrap: {
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF3B3B',
    borderWidth: 1.5,
    borderColor: COLORS.BACKGROUND,
  },
  /** Keeps icon row baseline aligned when dot is hidden */
  dotSlot: {
    marginTop: 6,
    height: 6,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
