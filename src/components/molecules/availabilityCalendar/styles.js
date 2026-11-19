import {StyleSheet} from 'react-native';
import {COLORS, FONTS} from '../../../constants';

export default StyleSheet.create({
  card: {
    backgroundColor: COLORS.WHITE,
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: 12,
    paddingHorizontal: 12,
    paddingTop: 14,
  },
  header: {
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  headerTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthNav: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
  },
  navButton: {
    alignItems: 'center',
    borderColor: COLORS.BORDER,
    borderRadius: 999,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  chevronLeft: {
    transform: [{rotate: '180deg'}],
  },
  monthLabel: {
    marginHorizontal: 10,
  },
  todayButton: {
    alignItems: 'center',
    borderColor: COLORS.BORDER,
    borderRadius: 8,
    borderWidth: 1,
    flexShrink: 0,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  legendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  legendDot: {
    alignItems: 'center',
    borderRadius: 999,
    height: 12,
    justifyContent: 'center',
    marginRight: 6,
    overflow: 'hidden',
    width: 12,
  },
  legendConfirmed: {
    backgroundColor: COLORS.PRIMARY,
  },
  legendBlocked: {
    backgroundColor: COLORS.GREYSCALE_200,
  },
  legendBlockedSlash: {
    backgroundColor: COLORS.GREYSCALE_500,
    height: 1.5,
    position: 'absolute',
    transform: [{rotate: '-45deg'}],
    width: 14,
  },
  legendSelected: {
    backgroundColor: '#D7EBD9',
    borderColor: '#B7D7BB',
    borderWidth: 1,
  },
  weekRow: {
    borderBottomColor: COLORS.BORDER_LIGHT,
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginBottom: 2,
    paddingBottom: 8,
  },
  weekDay: {
    alignItems: 'center',
    flex: 1,
  },
  weeks: {
    borderColor: COLORS.BORDER_LIGHT,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  weekBlock: {
    borderBottomColor: COLORS.BORDER_LIGHT,
    borderBottomWidth: 1,
    position: 'relative',
  },
  weekBlockLast: {
    borderBottomWidth: 0,
  },
  daysRow: {
    flexDirection: 'row',
  },
  dayCell: {
    backgroundColor: COLORS.WHITE,
    flex: 1,
    minHeight: 64,
    paddingHorizontal: 4,
    paddingTop: 6,
  },
  dayCellPast: {
    backgroundColor: COLORS.GREYSCALE_100,
  },
  dayCellSelected: {
    backgroundColor: '#D7EBD9',
  },
  dayCellBlocked: {
    backgroundColor: COLORS.GREYSCALE_100,
  },
  dayCellBooked: {
    backgroundColor: COLORS.WHITE,
  },
  dayNumberWrap: {
    alignItems: 'center',
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  dayNumberToday: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 999,
  },
  eventsLayer: {
    left: 0,
    paddingBottom: 6,
    paddingTop: 2,
    position: 'absolute',
    right: 0,
    top: 30,
  },
  eventPill: {
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    justifyContent: 'center',
    marginHorizontal: 2,
    minHeight: 20,
    paddingHorizontal: 6,
    paddingVertical: 3,
    position: 'absolute',
  },
  eventPillText: {
    color: COLORS.WHITE,
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    lineHeight: 13,
    textAlign: 'center',
  },
});
