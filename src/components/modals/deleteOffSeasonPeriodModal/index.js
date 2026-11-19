import React, {useCallback} from 'react';
import {ActivityIndicator, TouchableOpacity, View} from 'react-native';
import Modal from 'react-native-modal';
import {useTranslation} from 'react-i18next';
import {StyledText} from '../../atoms';
import {COLORS} from '../../../constants';
import {formatOffSeasonPeriodLabel} from '../../../utils/calendar';
import styles from './styles';

const DeleteOffSeasonPeriodModal = ({
  isVisible = false,
  period = null,
  isDeleting = false,
  errorMessage = '',
  onCancel,
  onConfirm,
}) => {
  const {t} = useTranslation();
  const periodLabel = formatOffSeasonPeriodLabel(period);

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
          {t('CALENDAR.OFF_SEASON_DELETE_TITLE')}
        </StyledText>

        <StyledText
          color={COLORS.TEXT_SECONDARY}
          size={14}
          containerStyle={styles.message}>
          {t('CALENDAR.OFF_SEASON_DELETE_MESSAGE', {period: periodLabel})}
        </StyledText>

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
            disabled={isDeleting}
            onPress={handleCancel}
            style={[styles.cancelButton, isDeleting && styles.disabledButton]}>
            <StyledText
              color={COLORS.LOGIN_PRIMARY}
              size={14}
              variant="semiBold">
              {t('CALENDAR.OFF_SEASON_DELETE_CANCEL')}
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
              <StyledText color={COLORS.WHITE} size={14} variant="semiBold">
                {t('CALENDAR.OFF_SEASON_DELETE_CONFIRM')}
              </StyledText>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteOffSeasonPeriodModal;
