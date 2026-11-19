import React, {useCallback, useMemo} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import {StyledText} from '../../atoms';
import {ChevronRightIcon} from '../../svgs';
import {COLORS} from '../../../constants';
import {
  getTodayCalendarString,
  isDateInRange,
  toCalendarDateString,
} from '../../../utils/calendar';
import styles from './styles';

export const DAY_STATUS = {
  OPEN: 'open',
  BLOCKED: 'blocked',
  BOOKED: 'booked',
};

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const EVENT_PILL_HEIGHT = 34;
const EVENT_PILL_GAP = 4;

const isUnavailableStatus = status =>
  status === DAY_STATUS.BLOCKED || status === DAY_STATUS.BOOKED;

const buildWeeks = ({
  month,
  todayString,
  startDate,
  endDate,
  highlightStart,
  highlightEnd,
  dayStatuses,
}) => {
  const startWeekday = month.day();
  const daysInMonth = month.daysInMonth();
  const cells = [];

  for (let i = 0; i < startWeekday; i += 1) {
    cells.push({key: `empty-start-${i}`, empty: true});
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = month.clone().date(day);
    const dateString = toCalendarDateString(date);
    const status = dayStatuses[dateString] || DAY_STATUS.OPEN;
    const unavailable = isUnavailableStatus(status);

    cells.push({
      key: dateString,
      empty: false,
      day,
      dateString,
      col: (startWeekday + day - 1) % 7,
      isPast: dateString < todayString,
      isToday: dateString === todayString,
      isUnavailable: unavailable,
      isSelected:
        !unavailable && isDateInRange(dateString, startDate, endDate),
      isHighlighted: isDateInRange(dateString, highlightStart, highlightEnd),
      status,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({key: `empty-end-${cells.length}`, empty: true});
  }

  const weeks = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }
  return weeks;
};

const assignEventLanes = segments => {
  const laneEnds = [];

  return segments
    .slice()
    .sort((a, b) => {
      if (a.startCol !== b.startCol) {
        return a.startCol - b.startCol;
      }
      return b.span - a.span;
    })
    .map(segment => {
      let lane = laneEnds.findIndex(endCol => segment.startCol > endCol);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(segment.endCol);
      } else {
        laneEnds[lane] = segment.endCol;
      }
      return {...segment, lane};
    });
};

const buildWeekEvents = (weekDays, bookings, month, t) => {
  const monthStart = month.clone().startOf('month').format('YYYY-MM-DD');
  const monthEnd = month.clone().endOf('month').format('YYYY-MM-DD');
  const firstVisible = weekDays.find(day => !day.empty)?.dateString;
  const lastVisible = [...weekDays]
    .reverse()
    .find(day => !day.empty)?.dateString;

  if (!firstVisible || !lastVisible) {
    return [];
  }

  const segments = [];

  bookings.forEach(booking => {
    const bookingStart = booking.startDate;
    const bookingEnd = booking.endDate || booking.startDate;
    if (!bookingStart || bookingEnd < monthStart || bookingStart > monthEnd) {
      return;
    }
    if (bookingEnd < firstVisible || bookingStart > lastVisible) {
      return;
    }

    const clippedStart =
      bookingStart < firstVisible ? firstVisible : bookingStart;
    const clippedEnd = bookingEnd > lastVisible ? lastVisible : bookingEnd;
    const startCol = weekDays.findIndex(
      day => !day.empty && day.dateString === clippedStart,
    );
    const endCol = weekDays.findIndex(
      day => !day.empty && day.dateString === clippedEnd,
    );

    if (startCol < 0 || endCol < 0 || endCol < startCol) {
      return;
    }

    const nights =
      Number(booking.nights) ||
      moment(bookingEnd).diff(moment(bookingStart), 'days') + 1;
    const guestName =
      String(booking.guestName || '').trim() ||
      t('CALENDAR.EVENT_GUEST_FALLBACK');
    const nightLabel = t(
      nights === 1 ? 'CALENDAR.EVENT_NIGHT_ONE' : 'CALENDAR.EVENT_NIGHT_OTHER',
      {count: nights},
    );

    segments.push({
      id: `${booking.id}-${firstVisible}`,
      bookingId: booking.id,
      startCol,
      endCol,
      span: endCol - startCol + 1,
      label: `${guestName} · ${nightLabel}`,
    });
  });

  return assignEventLanes(segments);
};

const AvailabilityCalendar = ({
  visibleMonth,
  startDate,
  endDate,
  highlightStart = null,
  highlightEnd = null,
  dayStatuses = {},
  bookings = [],
  onChangeMonth,
  onSelectDate,
  onPressToday,
  onPressBooking,
}) => {
  const {t} = useTranslation();
  const month = useMemo(
    () => moment(visibleMonth).startOf('month'),
    [visibleMonth],
  );
  const todayString = getTodayCalendarString();

  const weeks = useMemo(
    () =>
      buildWeeks({
        month,
        todayString,
        startDate,
        endDate,
        highlightStart,
        highlightEnd,
        dayStatuses,
      }),
    [
      dayStatuses,
      endDate,
      highlightEnd,
      highlightStart,
      month,
      startDate,
      todayString,
    ],
  );

  const weekEvents = useMemo(
    () => weeks.map(weekDays => buildWeekEvents(weekDays, bookings, month, t)),
    [bookings, month, t, weeks],
  );

  const handlePrevMonth = useCallback(() => {
    onChangeMonth?.(month.clone().subtract(1, 'month').toDate());
  }, [month, onChangeMonth]);

  const handleNextMonth = useCallback(() => {
    onChangeMonth?.(month.clone().add(1, 'month').toDate());
  }, [month, onChangeMonth]);

  const handleToday = useCallback(() => {
    onPressToday?.();
  }, [onPressToday]);

  const legend = [
    {
      key: 'confirmed',
      label: t('CALENDAR.LEGEND_CONFIRMED'),
      dotStyle: styles.legendConfirmed,
      showSlash: false,
    },
    {
      key: 'blocked',
      label: t('CALENDAR.LEGEND_BLOCKED'),
      dotStyle: styles.legendBlocked,
      showSlash: true,
    },
    {
      key: 'selected',
      label: t('CALENDAR.LEGEND_SELECTED'),
      dotStyle: styles.legendSelected,
      showSlash: false,
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.monthNav}>
            <TouchableOpacity
              accessibilityRole="button"
              hitSlop={8}
              onPress={handlePrevMonth}
              style={styles.navButton}>
              <View style={styles.chevronLeft}>
                <ChevronRightIcon color={COLORS.TEXT} />
              </View>
            </TouchableOpacity>
            <StyledText
              size={16}
              variant="semiBold"
              containerStyle={styles.monthLabel}>
              {month.format('MMMM YYYY')}
            </StyledText>
            <TouchableOpacity
              accessibilityRole="button"
              hitSlop={8}
              onPress={handleNextMonth}
              style={styles.navButton}>
              <ChevronRightIcon color={COLORS.TEXT} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.85}
            onPress={handleToday}
            style={styles.todayButton}>
            <StyledText size={12} variant="semiBold">
              {t('CALENDAR.TODAY')}
            </StyledText>
          </TouchableOpacity>
        </View>

        <View style={styles.legendRow}>
          {legend.map(item => (
            <View key={item.key} style={styles.legendItem}>
              <View style={[styles.legendDot, item.dotStyle]}>
                {item.showSlash ? (
                  <View style={styles.legendBlockedSlash} />
                ) : null}
              </View>
              <StyledText color={COLORS.TEXT_SECONDARY} size={12}>
                {item.label}
              </StyledText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.weekRow}>
        {WEEK_DAYS.map(label => (
          <View key={label} style={styles.weekDay}>
            <StyledText color={COLORS.TEXT_MUTED} size={11} variant="bold">
              {label}
            </StyledText>
          </View>
        ))}
      </View>

      <View style={styles.weeks}>
        {weeks.map((weekDays, weekIndex) => {
          const events = weekEvents[weekIndex] || [];
          const laneCount =
            events.reduce((max, event) => Math.max(max, event.lane + 1), 0) ||
            0;
          const eventsHeight =
            laneCount > 0
              ? laneCount * EVENT_PILL_HEIGHT +
                (laneCount - 1) * EVENT_PILL_GAP +
                8
              : 0;

          return (
            <View
              key={`week-${weekIndex}`}
              style={[
                styles.weekBlock,
                weekIndex === weeks.length - 1 && styles.weekBlockLast,
              ]}>
              <View style={styles.daysRow}>
                {weekDays.map(cell => {
                  if (cell.empty) {
                    return (
                      <View
                        key={cell.key}
                        style={[
                          styles.dayCell,
                          {minHeight: 64 + eventsHeight},
                        ]}
                      />
                    );
                  }

                  const muted = cell.isPast || cell.status === DAY_STATUS.BLOCKED;
                  const dayColor = cell.isToday
                    ? COLORS.WHITE
                    : cell.isHighlighted
                      ? COLORS.PRIMARY
                      : muted
                        ? COLORS.TEXT_MUTED
                        : COLORS.TEXT;

                  return (
                    <TouchableOpacity
                      key={cell.key}
                      activeOpacity={0.85}
                      disabled={cell.isPast || cell.isUnavailable}
                      onPress={() => onSelectDate?.(cell.dateString)}
                      style={[
                        styles.dayCell,
                        {minHeight: 64 + eventsHeight},
                        cell.isPast && styles.dayCellPast,
                        cell.status === DAY_STATUS.BLOCKED &&
                          styles.dayCellBlocked,
                        cell.status === DAY_STATUS.BOOKED &&
                          styles.dayCellBooked,
                        (cell.isSelected || cell.isHighlighted) &&
                          styles.dayCellSelected,
                      ]}>
                      <View
                        style={[
                          styles.dayNumberWrap,
                          cell.isToday && styles.dayNumberToday,
                        ]}>
                        <StyledText
                          color={dayColor}
                          size={12}
                          variant="semiBold">
                          {cell.day}
                        </StyledText>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {laneCount > 0 ? (
                <View
                  style={[styles.eventsLayer, {height: eventsHeight}]}
                  pointerEvents="box-none">
                  {events.map(event => (
                    <TouchableOpacity
                      key={event.id}
                      activeOpacity={0.9}
                      onPress={() => onPressBooking?.(event.bookingId)}
                      style={[
                        styles.eventPill,
                        {
                          left: `${(event.startCol / 7) * 100}%`,
                          right: `${((6 - event.endCol) / 7) * 100}%`,
                          top:
                            event.lane * (EVENT_PILL_HEIGHT + EVENT_PILL_GAP),
                        },
                      ]}>
                      <Text style={styles.eventPillText}>{event.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default AvailabilityCalendar;
