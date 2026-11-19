import React, {useCallback, useMemo} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import {CustomButton, StyledText} from '../../atoms';
import {CloseIcon} from '../../svgs';
import {COLORS} from '../../../constants';
import {formatCurrency, getInitials} from '../../../utils/invoice';
import styles from './styles';

const formatStayDate = dateString =>
  dateString ? moment(dateString, 'YYYY-MM-DD').format('ddd, MMM D') : '';

const CalendarBookingCard = ({
  booking = null,
  isViewing = false,
  onClose,
  onViewBooking,
}) => {
  const {t} = useTranslation();

  const guestName =
    String(booking?.guestName || '').trim() ||
    t('CALENDAR.EVENT_GUEST_FALLBACK');
  const guestEmail = String(booking?.guestEmail || '').trim();
  const nights = Number(booking?.nights) || 1;
  const guests = Number(booking?.guests) || 1;
  const priceLabel = formatCurrency(booking?.offeredPrice);

  const stayDates = useMemo(
    () => ({
      checkIn: formatStayDate(booking?.startDate || booking?.checkIn),
      checkOut: formatStayDate(booking?.checkOut),
    }),
    [booking?.checkIn, booking?.checkOut, booking?.startDate],
  );

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const handleViewBooking = useCallback(() => {
    if (!booking?.id || isViewing) {
      return;
    }
    onViewBooking?.(booking.id);
  }, [booking?.id, isViewing, onViewBooking]);

  if (!booking?.id) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.statusBadge}>
          <StyledText color={COLORS.WHITE} size={12} variant="semiBold">
            {t('CALENDAR.BOOKING_STATUS_CONFIRMED')}
          </StyledText>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          hitSlop={8}
          onPress={handleClose}
          style={styles.closeButton}>
          <CloseIcon color={COLORS.TEXT_MUTED} size={14} />
        </TouchableOpacity>
      </View>

      <View style={styles.guestRow}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{getInitials(guestName)}</Text>
        </View>
        <View style={styles.guestCopy}>
          <StyledText size={15} variant="semiBold">
            {guestName}
          </StyledText>
          {!!guestEmail && (
            <StyledText
              color={COLORS.TEXT_SECONDARY}
              size={12}
              containerStyle={styles.guestEmail}>
              {guestEmail}
            </StyledText>
          )}
        </View>
      </View>

      <View style={styles.stayRow}>
        <View style={styles.staySide}>
          <StyledText
            color={COLORS.TEXT_MUTED}
            size={11}
            containerStyle={styles.stayLabel}>
            {t('CALENDAR.BOOKING_CHECK_IN')}
          </StyledText>
          <StyledText size={13} variant="semiBold">
            {stayDates.checkIn}
          </StyledText>
        </View>
        <StyledText
          color={COLORS.TEXT_MUTED}
          size={12}
          containerStyle={styles.stayNights}>
          {t(
            nights === 1
              ? 'CALENDAR.EVENT_NIGHT_ONE'
              : 'CALENDAR.EVENT_NIGHT_OTHER',
            {count: nights},
          )}
        </StyledText>
        <View style={[styles.staySide, styles.staySideEnd]}>
          <StyledText
            color={COLORS.TEXT_MUTED}
            size={11}
            containerStyle={styles.stayLabel}>
            {t('CALENDAR.BOOKING_CHECK_OUT')}
          </StyledText>
          <StyledText size={13} variant="semiBold">
            {stayDates.checkOut}
          </StyledText>
        </View>
      </View>

      <View style={styles.metaRow}>
        <StyledText color={COLORS.TEXT_SECONDARY} size={13}>
          {t('CALENDAR.BOOKING_GUESTS')}
        </StyledText>
        <StyledText size={13} variant="semiBold">
          {t(
            guests === 1
              ? 'CALENDAR.BOOKING_GUEST_ONE'
              : 'CALENDAR.BOOKING_GUEST_OTHER',
            {count: guests},
          )}
        </StyledText>
      </View>
      <View style={[styles.metaRow, styles.metaRowLast]}>
        <StyledText color={COLORS.TEXT_SECONDARY} size={13}>
          {t('CALENDAR.BOOKING_PRICE')}
        </StyledText>
        <StyledText size={13} variant="semiBold">
          {priceLabel}
        </StyledText>
      </View>

      <CustomButton
        title={t('CALENDAR.BOOKING_VIEW')}
        onPress={handleViewBooking}
        isLoading={isViewing}
        isDisabled={isViewing}
        containerStyle={styles.viewButton}
      />
    </View>
  );
};

export default CalendarBookingCard;
