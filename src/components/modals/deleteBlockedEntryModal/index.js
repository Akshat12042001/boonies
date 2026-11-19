import React, {useCallback, useMemo} from 'react';
import {ActivityIndicator, Text, TouchableOpacity, View} from 'react-native';
import Modal from 'react-native-modal';
import {useTranslation} from 'react-i18next';
import {StyledText} from '../../atoms';
import {TrashIcon} from '../../svgs';
import {COLORS, FONTS} from '../../../constants';
import {formatCalendarDisplayDate} from '../../../utils/calendar';
import styles from './styles';

const DeleteBlockedEntryModal = ({
  isVisible = false,
  startDate = '',
  endDate = '',
  isDeleting = false,
  onCancel,
  onConfirm,
}) => {
  const {t} = useTranslation();

  const rangeLabel = useMemo(() => {
    if (!startDate) {
      return '';
    }
    const startLabel = formatCalendarDisplayDate(startDate);
    const endLabel = formatCalendarDisplayDate(endDate || startDate);
    return `${startLabel} → ${endLabel}`;
  }, [endDate, startDate]);

  const handleCancel = useCallback(() => {
    if (isDeleting) {
      return;
    }
    onCancel?.();
  }, [isDeleting, onCancel]);

  const handleConfirm = useCallback(() => {
    if (isDeleting) {
      return;
    }
    onConfirm?.();
  }, [isDeleting, onConfirm]);

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
      useNativeDriver>
      <View style={styles.container}>
        <StyledText variant="bold" size={18} containerStyle={styles.title}>
          {t('CALENDAR.DELETE_BLOCK_TITLE')}
        </StyledText>

        <Text
          style={{
            color: COLORS.TEXT_SECONDARY,
            fontFamily: FONTS.regular,
            fontSize: 14,
            lineHeight: 22,
          }}>
          {t('CALENDAR.DELETE_BLOCK_MESSAGE_BEFORE')}
          <Text style={styles.messageBold}>{rangeLabel}</Text>
          {t('CALENDAR.DELETE_BLOCK_MESSAGE_AFTER')}
        </Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            accessibilityRole="button"
            disabled={isDeleting}
            onPress={handleCancel}
            style={[styles.cancelButton, isDeleting && styles.disabledButton]}>
            <StyledText
              color={COLORS.LOGIN_PRIMARY}
              size={14}
              variant="semiBold">
              {t('CALENDAR.DELETE_BLOCK_CANCEL')}
            </StyledText>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            disabled={isDeleting}
            onPress={handleConfirm}
            style={[styles.deleteButton, isDeleting && styles.disabledButton]}>
            {isDeleting ? (
              <ActivityIndicator color={COLORS.WHITE} size="small" />
            ) : (
              <>
                <TrashIcon color={COLORS.WHITE} size={16} />
                <StyledText
                  color={COLORS.WHITE}
                  size={14}
                  variant="semiBold"
                  containerStyle={styles.deleteLabel}>
                  {t('CALENDAR.DELETE_BLOCK_CONFIRM')}
                </StyledText>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteBlockedEntryModal;
