import React, {useCallback} from 'react';
import {ActivityIndicator, Text, TouchableOpacity, View} from 'react-native';
import Modal from 'react-native-modal';
import {useTranslation} from 'react-i18next';
import {StyledText} from '../../atoms';
import {COLORS, FONTS} from '../../../constants';
import styles from './styles';

const ResendStaffInvitationModal = ({
  isVisible = false,
  email = '',
  isSubmitting = false,
  onCancel,
  onConfirm,
}) => {
  const {t} = useTranslation();

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
    onConfirm?.();
  }, [isSubmitting, onConfirm]);

  const displayEmail =
    String(email || '').trim() || t('STAFF.RESEND_EMAIL_FALLBACK');

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
          {t('STAFF.RESEND_TITLE')}
        </StyledText>
        <StyledText
          color={COLORS.TEXT_SECONDARY}
          size={14}
          containerStyle={styles.message}>
          {t('STAFF.RESEND_MESSAGE_BEFORE')}
          <Text
            style={{
              color: COLORS.GREYSCALE_900,
              fontFamily: FONTS.semiBold,
              fontSize: 14,
            }}>
            {displayEmail}
          </Text>
          {t('STAFF.RESEND_MESSAGE_AFTER')}
        </StyledText>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={handleCancel}
            style={[styles.cancelButton, isSubmitting && styles.disabledButton]}>
            <StyledText
              color={COLORS.LOGIN_PRIMARY}
              variant="semiBold"
              size={14}>
              {t('STAFF.RESEND_CANCEL')}
            </StyledText>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={handleConfirm}
            style={[
              styles.confirmButton,
              isSubmitting && styles.disabledButton,
            ]}>
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.WHITE} size="small" />
            ) : (
              <StyledText color={COLORS.WHITE} variant="semiBold" size={14}>
                {t('STAFF.RESEND_CONFIRM')}
              </StyledText>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ResendStaffInvitationModal;
