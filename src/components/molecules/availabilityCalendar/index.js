import React, {useCallback, useMemo} from 'react';
import {TouchableOpacity, View} from 'react-native';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import {StyledText} from '../../atoms';
import {CalendarIcon, ChevronRightIcon} from '../../svgs';
import {COLORS} from '../../../constants';
import {
  formatCompactPrice,
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

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const getDayInnerStyle = (status, isSelected, isPast) => {
  if (isSelected) {
    return styles.dayInnerSelected;
  }
  if (isPast) {
    return styles.dayInnerPast;
  }
  if (status === DAY_STATUS.BLOCKED) {
    return styles.dayInnerBlocked;
  }
  if (status === DAY_STATUS.BOOKED) {
    return styles.dayInnerBooked;
  }
  return styles.dayInnerOpen;
};

const AvailabilityCalendar = ({
  visibleMonth,
  startDate,
  endDate,
  dayPrices = {},
  dayStatuses = {},
  defaultPrice,
  onChangeMonth,
  onSelectDate,
  onPressToday,
}) => {
  const {t} = useTranslation();
  const month = useMemo(
    () => moment(visibleMonth).startOf('month'),
    [visibleMonth],
  );
  const todayString = getTodayCalendarString();

  const days = useMemo(() => {
    const startWeekday = month.day();
    const daysInMonth = month.daysInMonth();
    const cells = [];

    for (let i = 0; i < startWeekday; i += 1) {
      cells.push({key: `empty-${i}`, empty: true});
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = month.clone().date(day);
      const dateString = toCalendarDateString(date);
      cells.push({
        key: dateString,
        empty: false,
        day,
        dateString,
        isPast: dateString < todayString,
        isSelected: isDateInRange(dateString, startDate, endDate),
        status: dayStatuses[dateString] || DAY_STATUS.OPEN,
        priceLabel:
          dayPrices[dateString] || formatCompactPrice(defaultPrice) || '',
      });
    }

    return cells;
  }, [
    dayPrices,
    dayStatuses,
    defaultPrice,
    endDate,
    month,
    startDate,
    todayString,
  ]);

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
      key: 'selected',
      label: t('CALENDAR.LEGEND_SELECTED'),
      dotStyle: styles.legendSelected,
      textColor: COLORS.WHITE,
    },
    {
      key: 'blocked',
      label: t('CALENDAR.LEGEND_BLOCKED'),
      dotStyle: styles.legendBlocked,
      textColor: COLORS.TEXT_MUTED,
    },
    {
      key: 'booked',
      label: t('CALENDAR.LEGEND_BOOKED'),
      dotStyle: styles.legendBooked,
      textColor: '#E05A6A',
    },
    {
      key: 'open',
      label: t('CALENDAR.LEGEND_OPEN'),
      dotStyle: styles.legendOpen,
      textColor: COLORS.TEXT_MUTED,
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerSide}>
          <TouchableOpacity
            accessibilityRole="button"
            hitSlop={8}
            onPress={handlePrevMonth}
            style={styles.navButton}>
            <View style={styles.chevronLeft}>
              <ChevronRightIcon color={COLORS.TEXT} />
            </View>
          </TouchableOpacity>
        </View>

        <StyledText size={16} variant="semiBold">
          {month.format('MMMM YYYY')}
        </StyledText>

        <View style={[styles.headerSide, styles.headerSideEnd]}>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.85}
            onPress={handleToday}
            style={styles.todayButton}>
            <CalendarIcon color={COLORS.LOGIN_PRIMARY} size={14} />
            <StyledText
              color={COLORS.LOGIN_PRIMARY}
              size={12}
              variant="semiBold"
              containerStyle={styles.todayLabel}>
              {t('CALENDAR.TODAY')}
            </StyledText>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            hitSlop={8}
            onPress={handleNextMonth}
            style={styles.navButton}>
            <ChevronRightIcon color={COLORS.TEXT} />
          </TouchableOpacity>
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

      <View style={styles.daysGrid}>
        {days.map(cell => {
          if (cell.empty) {
            return <View key={cell.key} style={styles.dayCell} />;
          }

          const muted = cell.isPast && !cell.isSelected;
          const dayColor = cell.isSelected
            ? COLORS.WHITE
            : muted
              ? COLORS.TEXT_MUTED
              : COLORS.TEXT;
          const priceColor = cell.isSelected
            ? COLORS.WHITE
            : muted
              ? COLORS.TEXT_MUTED
              : COLORS.TEXT;

          return (
            <TouchableOpacity
              key={cell.key}
              activeOpacity={0.85}
              disabled={cell.isPast}
              onPress={() => onSelectDate?.(cell.dateString)}
              style={styles.dayCell}>
              <View
                style={[
                  styles.dayInner,
                  getDayInnerStyle(cell.status, cell.isSelected, cell.isPast),
                ]}>
                <StyledText color={dayColor} size={12} variant="semiBold">
                  {cell.day}
                </StyledText>
                {!!cell.priceLabel && (
                  <StyledText
                    color={priceColor}
                    size={10}
                    variant="medium"
                    containerStyle={styles.dayPrice}>
                    {cell.priceLabel}
                  </StyledText>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.legendRow}>
        {legend.map(item => (
          <View key={item.key} style={styles.legendItem}>
            <View style={[styles.legendDot, item.dotStyle]}>
              <StyledText color={item.textColor} size={10} variant="semiBold">
                1
              </StyledText>
            </View>
            <StyledText color={COLORS.TEXT_SECONDARY} size={12}>
              {item.label}
            </StyledText>
          </View>
        ))}
      </View>
    </View>
  );
};

export default AvailabilityCalendar;
