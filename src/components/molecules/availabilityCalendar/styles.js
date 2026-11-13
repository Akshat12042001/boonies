import {StyleSheet} from 'react-native';
import {COLORS} from '../../../constants';

export default StyleSheet.create({
  card: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 16,
    borderWidth: 1,
    paddingBottom: 14,
    paddingHorizontal: 12,
    paddingTop: 14,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  headerSide: {
    alignItems: 'center',
    flexDirection: 'row',
    minWidth: 88,
  },
  headerSideEnd: {
    justifyContent: 'flex-end',
  },
  navButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  chevronLeft: {
    transform: [{rotate: '180deg'}],
  },
  todayButton: {
    alignItems: 'center',
    backgroundColor: COLORS.MENU_GREEN_BACKGROUND,
    borderRadius: 999,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  todayLabel: {
    marginLeft: 4,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
    marginTop: 4,
  },
  weekDay: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    height: 54,
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 6,
    paddingVertical: 6,
    width: `${100 / 7}%`,
  },
  dayInner: {
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    paddingVertical: 4,
  },
  dayInnerPast: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER_LIGHT,
  },
  dayInnerOpen: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER_LIGHT,
  },
  dayInnerBlocked: {
    backgroundColor: COLORS.GREYSCALE_100,
    borderColor: COLORS.BORDER_LIGHT,
  },
  dayInnerBooked: {
    backgroundColor: '#FDE8EC',
    borderColor: '#F4C4CC',
  },
  dayInnerSelected: {
    backgroundColor: COLORS.GREYSCALE_900,
    borderColor: COLORS.GREYSCALE_900,
  },
  dayEmpty: {
    opacity: 0,
  },
  dayPrice: {
    alignSelf: 'flex-end',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 2,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 4,
    marginRight: 8,
  },
  legendDot: {
    alignItems: 'center',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    marginRight: 6,
    width: 20,
  },
  legendSelected: {
    backgroundColor: COLORS.GREYSCALE_900,
  },
  legendBlocked: {
    backgroundColor: COLORS.GREYSCALE_100,
  },
  legendBooked: {
    backgroundColor: '#FDE8EC',
  },
  legendOpen: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER,
    borderWidth: 1,
  },
});
