import React from 'react';
import {TextInput, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {CustomButton, StyledText} from '../../atoms';
import {CheckIcon} from '../../svgs';
import {COLORS} from '../../../constants';
import {
  formatCalendarDisplayDate,
  formatCompactPrice,
  getInclusiveDayCount,
} from '../../../utils/calendar';
import styles from './styles';

const PriceFooter = ({priceLabel}) => {
  const {t} = useTranslation();

  return (
    <>
      <View style={styles.divider} />
      <View style={styles.priceRow}>
        <StyledText color={COLORS.TEXT_SECONDARY} size={13}>
          {t('CALENDAR.PRICE_PER_NIGHT_LABEL')}
        </StyledText>
        <StyledText size={14} variant="bold">
          {priceLabel}
        </StyledText>
      </View>
    </>
  );
};

const CalendarSelectionCard = ({
  startDate,
  endDate,
  reason = '',
  pricePerDay,
  onChangeReason,
  onClearStart,
  onClearSelection,
  onBlockDates,
}) => {
  const {t} = useTranslation();
  const priceLabel = formatCompactPrice(pricePerDay) || '₹0';

  if (!startDate) {
    return (
      <View style={styles.card}>
        <StyledText
          color={COLORS.PRIMARY}
          size={16}
          variant="semiBold"
          containerStyle={styles.title}>
          {t('CALENDAR.SELECT_DATES_TITLE')}
        </StyledText>
        <StyledText
          color={COLORS.TEXT_SECONDARY}
          size={13}
          containerStyle={styles.description}>
          {t('CALENDAR.SELECT_DATES_DESCRIPTION')}
        </StyledText>
        <PriceFooter priceLabel={priceLabel} />
      </View>
    );
  }

  if (!endDate) {
    return (
      <View style={styles.card}>
        <StyledText
          color={COLORS.PRIMARY}
          size={16}
          variant="semiBold"
          containerStyle={styles.title}>
          {t('CALENDAR.PICK_END_DATE_TITLE')}
        </StyledText>
        <StyledText
          color={COLORS.TEXT_SECONDARY}
          size={13}
          containerStyle={styles.description}>
          {t('CALENDAR.PICK_END_DATE_DESCRIPTION', {
            date: formatCalendarDisplayDate(startDate),
          })}
        </StyledText>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.85}
          hitSlop={8}
          onPress={onClearStart}
          style={styles.clearLink}>
          <StyledText color={COLORS.PRIMARY} size={14} variant="semiBold">
            {t('CALENDAR.CLEAR_START_DATE')}
          </StyledText>
        </TouchableOpacity>
        <PriceFooter priceLabel={priceLabel} />
      </View>
    );
  }

  const dayCount = getInclusiveDayCount(startDate, endDate);
  const rangeLabel = `${formatCalendarDisplayDate(startDate)} - ${formatCalendarDisplayDate(endDate)}`;

  return (
    <View style={styles.card}>
      <View style={styles.rangeHeader}>
        <View style={styles.availableBadge}>
          <CheckIcon color={COLORS.LOGIN_PRIMARY} size={14} />
          <StyledText
            color={COLORS.LOGIN_PRIMARY}
            size={13}
            variant="semiBold"
            containerStyle={styles.availableLabel}>
            {t('CALENDAR.AVAILABLE')}
          </StyledText>
        </View>
        <StyledText color={COLORS.TEXT_SECONDARY} size={13} variant="semiBold">
          {t('CALENDAR.DAY_COUNT', {count: dayCount})}
        </StyledText>
      </View>

      <StyledText
        size={16}
        variant="semiBold"
        containerStyle={styles.rangeTitle}>
        {rangeLabel}
      </StyledText>

      <TextInput
        placeholder={t('CALENDAR.REASON_PLACEHOLDER')}
        placeholderTextColor={COLORS.TEXT_MUTED}
        style={styles.reasonInput}
        value={reason}
        onChangeText={onChangeReason}
      />

      <CustomButton
        title={t('CALENDAR.BLOCK_DATES')}
        onPress={onBlockDates}
        containerStyle={styles.primaryButton}
      />

      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.85}
        onPress={onClearSelection}
        style={styles.secondaryButton}>
        <StyledText color={COLORS.LOGIN_PRIMARY} size={15} variant="semiBold">
          {t('CALENDAR.CLEAR_SELECTION')}
        </StyledText>
      </TouchableOpacity>

      <PriceFooter priceLabel={priceLabel} />
    </View>
  );
};

export default CalendarSelectionCard;
