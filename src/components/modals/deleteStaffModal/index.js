import React, {useCallback} from 'react';
import {ActivityIndicator, Text, TouchableOpacity, View} from 'react-native';
import Modal from 'react-native-modal';
import {useTranslation} from 'react-i18next';
import {StyledText} from '../../atoms';
import {COLORS, FONTS} from '../../../constants';
import styles from './styles';

const DeleteStaffModal = ({
  isVisible = false,
  staffName = '',
  isDeleting = false,
  onCancel,
  onConfirm,
}) => {
  const {t} = useTranslation();

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

  const displayName =
    String(staffName || '').trim() || t('STAFF.DELETE_NAME_FALLBACK');

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
          {t('STAFF.DELETE_TITLE')}
        </StyledText>
        <StyledText
          color={COLORS.TEXT_SECONDARY}
          size={14}
          containerStyle={styles.message}>
          <Text
            style={{
              color: COLORS.GREYSCALE_900,
              fontFamily: FONTS.semiBold,
              fontSize: 14,
            }}>
            {displayName}
          </Text>
          {t('STAFF.DELETE_MESSAGE_AFTER')}
        </StyledText>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            accessibilityRole="button"
            disabled={isDeleting}
            onPress={handleCancel}
            style={[styles.cancelButton, isDeleting && styles.disabledButton]}>
            <StyledText color={COLORS.LOGIN_PRIMARY} variant="semiBold" size={14}>
              {t('STAFF.DELETE_CANCEL')}
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
              <StyledText color={COLORS.WHITE} variant="semiBold" size={14}>
                {t('STAFF.DELETE_CONFIRM')}
              </StyledText>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteStaffModal;
