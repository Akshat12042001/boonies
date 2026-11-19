import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, TouchableOpacity, View} from 'react-native';
import Modal from 'react-native-modal';
import {Dropdown} from 'react-native-element-dropdown';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import {StyledText} from '../../atoms';
import {COLORS, FONTS} from '../../../constants';
import styles from './styles';

const MONTH_OPTIONS = moment.months().map((label, index) => ({
  value: index + 1,
  label,
}));

const DEFAULT_PERIOD = {
  startMonth: 11,
  startDay: 15,
  endMonth: 2,
  endDay: 28,
};

const getDaysInMonth = month => {
  // Use a leap year so February always offers 29 days for recurring windows.
  return moment({year: 2024, month: month - 1}).daysInMonth();
};

const buildDayOptions = month =>
  Array.from({length: getDaysInMonth(month)}, (_, index) => ({
    value: index + 1,
    label: String(index + 1),
  }));

const FieldDropdown = ({
  label,
  data,
  value,
  isFocused,
  onFocus,
  onBlur,
  onChange,
  zIndex,
}) => (
  <View
    style={[
      styles.fieldWrap,
      isFocused && styles.fieldWrapOpen,
      {zIndex},
    ]}>
    <StyledText
      color={isFocused ? COLORS.LOGIN_PRIMARY : COLORS.GREYSCALE_500}
      size={11}
      containerStyle={styles.fieldLabel}>
      {label}
    </StyledText>
    <Dropdown
      data={data}
      labelField="label"
      valueField="value"
      value={value}
      onFocus={onFocus}
      onBlur={onBlur}
      onChange={item => onChange(item.value)}
      maxHeight={180}
      dropdownPosition="auto"
      style={[
        styles.dropdownField,
        isFocused && styles.dropdownFieldFocused,
      ]}
      placeholderStyle={styles.dropdownPlaceholder}
      selectedTextStyle={styles.dropdownSelectedText}
      itemTextStyle={styles.dropdownItemText}
      containerStyle={styles.dropdownList}
      activeColor="#EDF4EF"
      fontFamily={FONTS.regular}
    />
  </View>
);

const AddOffSeasonPeriodModal = ({
  isVisible = false,
  isSubmitting = false,
  errorMessage = '',
  initialPeriod = null,
  onCancel,
  onConfirm,
  onClearError,
}) => {
  const {t} = useTranslation();
  const isEditing = Boolean(initialPeriod?.id);
  const [startMonth, setStartMonth] = useState(DEFAULT_PERIOD.startMonth);
  const [startDay, setStartDay] = useState(DEFAULT_PERIOD.startDay);
  const [endMonth, setEndMonth] = useState(DEFAULT_PERIOD.endMonth);
  const [endDay, setEndDay] = useState(DEFAULT_PERIOD.endDay);
  const [focusedField, setFocusedField] = useState(null);

  const updateField = useCallback(
    setter => value => {
      onClearError?.();
      setter(value);
    },
    [onClearError],
  );

  useEffect(() => {
    if (!isVisible) {
      setFocusedField(null);
      return;
    }

    setStartMonth(initialPeriod?.startMonth || DEFAULT_PERIOD.startMonth);
    setStartDay(initialPeriod?.startDay || DEFAULT_PERIOD.startDay);
    setEndMonth(initialPeriod?.endMonth || DEFAULT_PERIOD.endMonth);
    setEndDay(initialPeriod?.endDay || DEFAULT_PERIOD.endDay);
  }, [initialPeriod, isVisible]);

  useEffect(() => {
    const maxStartDay = getDaysInMonth(startMonth);
    if (startDay > maxStartDay) {
      setStartDay(maxStartDay);
    }
  }, [startDay, startMonth]);

  useEffect(() => {
    const maxEndDay = getDaysInMonth(endMonth);
    if (endDay > maxEndDay) {
      setEndDay(maxEndDay);
    }
  }, [endDay, endMonth]);

  const startDayOptions = useMemo(
    () => buildDayOptions(startMonth),
    [startMonth],
  );
  const endDayOptions = useMemo(() => buildDayOptions(endMonth), [endMonth]);

  const handleCancel = useCallback(() => {
    if (isSubmitting) {
      return;
    }
    onCancel?.();
  }, [isSubmitting, onCancel]);

  const handleConfirm = useCallback(() => {
    if (isSubmitting) {
      return;
    }
    onConfirm?.({
      id: initialPeriod?.id,
      startMonth,
      startDay,
      endMonth,
      endDay,
    });
  }, [
    endDay,
    endMonth,
    initialPeriod?.id,
    isSubmitting,
    onConfirm,
    startDay,
    startMonth,
  ]);

  return (
    <Modal
      isVisible={isVisible}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropTransitionOutTiming={0}
      hideModalContentWhileAnimating
      onBackButtonPress={handleCancel}
      onBackdropPress={handleCancel}
      style={styles.modal}
      useNativeDriver
      propagateSwipe>
      <View style={styles.container}>
        <StyledText variant="bold" size={18} containerStyle={styles.title}>
          {isEditing
            ? t('CALENDAR.OFF_SEASON_EDIT_MODAL_TITLE')
            : t('CALENDAR.OFF_SEASON_ADD_MODAL_TITLE')}
        </StyledText>

        <View style={styles.fieldsRow}>
          <FieldDropdown
            label={t('CALENDAR.OFF_SEASON_START_MONTH')}
            data={MONTH_OPTIONS}
            value={startMonth}
            isFocused={focusedField === 'startMonth'}
            onFocus={() => setFocusedField('startMonth')}
            onBlur={() => setFocusedField(null)}
            onChange={updateField(setStartMonth)}
            zIndex={40}
          />
          <FieldDropdown
            label={t('CALENDAR.OFF_SEASON_START_DAY')}
            data={startDayOptions}
            value={startDay}
            isFocused={focusedField === 'startDay'}
            onFocus={() => setFocusedField('startDay')}
            onBlur={() => setFocusedField(null)}
            onChange={updateField(setStartDay)}
            zIndex={30}
          />
          <FieldDropdown
            label={t('CALENDAR.OFF_SEASON_END_MONTH')}
            data={MONTH_OPTIONS}
            value={endMonth}
            isFocused={focusedField === 'endMonth'}
            onFocus={() => setFocusedField('endMonth')}
            onBlur={() => setFocusedField(null)}
            onChange={updateField(setEndMonth)}
            zIndex={20}
          />
          <FieldDropdown
            label={t('CALENDAR.OFF_SEASON_END_DAY')}
            data={endDayOptions}
            value={endDay}
            isFocused={focusedField === 'endDay'}
            onFocus={() => setFocusedField('endDay')}
            onBlur={() => setFocusedField(null)}
            onChange={updateField(setEndDay)}
            zIndex={10}
          />
        </View>

        {!!errorMessage && (
          <StyledText
            color={COLORS.RED_ERROR}
            size={12}
            containerStyle={styles.errorText}>
            {errorMessage}
          </StyledText>
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={handleCancel}
            style={styles.cancelButton}>
            <StyledText
              color={COLORS.LOGIN_PRIMARY}
              size={14}
              variant="semiBold">
              {t('CALENDAR.OFF_SEASON_CANCEL')}
            </StyledText>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={handleConfirm}
            style={[styles.confirmButton, isSubmitting && {opacity: 0.65}]}>
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.WHITE} size="small" />
            ) : (
              <StyledText color={COLORS.WHITE} size={14} variant="semiBold">
                {isEditing
                  ? t('CALENDAR.OFF_SEASON_CONFIRM_SAVE')
                  : t('CALENDAR.OFF_SEASON_CONFIRM_ADD')}
              </StyledText>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AddOffSeasonPeriodModal;
