import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import {Formik} from 'formik';
import {useTranslation} from 'react-i18next';
import {AnimatedSwitch, Input, StyledText} from '../../atoms';
import {COLORS, FORM_SCHEMA} from '../../../constants';
import {buildStaffFormValues, EMPTY_STAFF_FORM_VALUES} from '../../../utils/staff';
import {
  EMPTY_INVITE_STAFF_VALUES,
  STAFF_PERMISSION_OPTIONS,
} from './config';
import styles from './styles';

const InviteStaffModal = ({
  isVisible = false,
  isSubmitting = false,
  staffMember = null,
  onCancel,
  onSubmit,
}) => {
  const {t} = useTranslation();
  const formikRef = useRef(null);
  const isEditMode = Boolean(staffMember?.id);

  const initialValues = useMemo(
    () =>
      isEditMode
        ? buildStaffFormValues(staffMember)
        : EMPTY_INVITE_STAFF_VALUES,
    [isEditMode, staffMember],
  );

  useEffect(() => {
    if (!isVisible) {
      return;
    }
    formikRef.current?.resetForm({
      values: isEditMode
        ? buildStaffFormValues(staffMember)
        : EMPTY_STAFF_FORM_VALUES,
    });
  }, [isEditMode, isVisible, staffMember]);

  const handleCancel = useCallback(() => {
    if (isSubmitting) {
      return;
    }
    onCancel?.();
  }, [isSubmitting, onCancel]);

  const handleFormSubmit = useCallback(
    values => {
      if (isSubmitting) {
        return;
      }
      onSubmit?.(values, {isEditMode, staffMember});
    },
    [isEditMode, isSubmitting, onSubmit, staffMember],
  );

  return (
    <Modal
      isVisible={isVisible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      avoidKeyboard
      backdropTransitionOutTiming={0}
      hideModalContentWhileAnimating
      onBackButtonPress={handleCancel}
      onBackdropPress={handleCancel}
      style={styles.modal}
      useNativeDriver>
      <View style={styles.container}>
        <Formik
          enableReinitialize
          innerRef={formikRef}
          initialValues={initialValues}
          validationSchema={FORM_SCHEMA.INVITE_STAFF.schema}
          validateOnChange
          validateOnBlur
          onSubmit={handleFormSubmit}>
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit,
            setFieldValue,
            setFieldTouched,
          }) => (
            <>
              <ScrollView
                bounces={false}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                <StyledText
                  variant="bold"
                  size={18}
                  containerStyle={styles.title}>
                  {t(isEditMode ? 'STAFF.EDIT.TITLE' : 'STAFF.INVITE.TITLE')}
                </StyledText>
                <StyledText
                  color={COLORS.TEXT_SECONDARY}
                  size={13}
                  containerStyle={styles.subtitle}>
                  {t(
                    isEditMode
                      ? 'STAFF.EDIT.DESCRIPTION'
                      : 'STAFF.INVITE.SUBTITLE',
                  )}
                </StyledText>

                <View style={styles.nameRow}>
                  <Input
                    label={t('STAFF.INVITE.FIRST_NAME')}
                    value={values.firstName}
                    onChangeText={handleChange('firstName')}
                    onBlur={handleBlur('firstName')}
                    error={touched.firstName && errors.firstName}
                    editable={!isSubmitting}
                    autoCapitalize="words"
                    borderColor={COLORS.LOGIN_INPUT_BORDER}
                    focusedBorderColor={COLORS.LOGIN_PRIMARY}
                    containerStyles={styles.nameField}
                    returnKeyType="next"
                  />
                  <Input
                    label={t('STAFF.INVITE.LAST_NAME')}
                    value={values.lastName}
                    onChangeText={handleChange('lastName')}
                    onBlur={handleBlur('lastName')}
                    error={touched.lastName && errors.lastName}
                    editable={!isSubmitting}
                    autoCapitalize="words"
                    borderColor={COLORS.LOGIN_INPUT_BORDER}
                    focusedBorderColor={COLORS.LOGIN_PRIMARY}
                    containerStyles={styles.nameField}
                    returnKeyType="next"
                  />
                </View>

                <Input
                  label={t('STAFF.INVITE.EMAIL')}
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={touched.email && errors.email}
                  editable={!isSubmitting}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  borderColor={COLORS.LOGIN_INPUT_BORDER}
                  focusedBorderColor={COLORS.LOGIN_PRIMARY}
                  returnKeyType="next"
                />

                <Input
                  label={t('STAFF.INVITE.PHONE')}
                  value={values.phone}
                  onChangeText={text => {
                    const digitsOnly = text.replace(/[^\d]/g, '').slice(0, 10);
                    setFieldValue('phone', digitsOnly);
                  }}
                  onBlur={handleBlur('phone')}
                  error={touched.phone && errors.phone}
                  editable={!isSubmitting}
                  keyboardType="number-pad"
                  maxLength={10}
                  borderColor={COLORS.LOGIN_INPUT_BORDER}
                  focusedBorderColor={COLORS.LOGIN_PRIMARY}
                  returnKeyType="done"
                />
                {!(touched.phone && errors.phone) ? (
                  <StyledText
                    color={COLORS.TEXT_MUTED}
                    size={12}
                    containerStyle={styles.phoneHint}>
                    {t('STAFF.INVITE.PHONE_HINT')}
                  </StyledText>
                ) : null}

                <StyledText
                  variant="bold"
                  size={16}
                  containerStyle={styles.sectionTitle}>
                  {t('STAFF.INVITE.ACCESS_TITLE')}
                </StyledText>
                <StyledText
                  color={COLORS.TEXT_SECONDARY}
                  size={13}
                  containerStyle={styles.sectionSubtitle}>
                  {t('STAFF.INVITE.ACCESS_SUBTITLE')}
                </StyledText>

                {STAFF_PERMISSION_OPTIONS.map(option => {
                  const Icon = option.Icon;
                  const enabled = Boolean(values.permissions?.[option.id]);

                  return (
                    <View key={option.id} style={styles.permissionCard}>
                      <View
                        style={[
                          styles.permissionIcon,
                          {backgroundColor: option.background},
                        ]}>
                        <Icon
                          color={option.color}
                          size={20}
                          width={20}
                          height={20}
                        />
                      </View>
                      <View style={styles.permissionCopy}>
                        <StyledText variant="semiBold" size={14}>
                          {t(option.titleKey)}
                        </StyledText>
                        <StyledText
                          color={COLORS.TEXT_SECONDARY}
                          size={12}
                          containerStyle={styles.permissionDescription}>
                          {t(option.descriptionKey)}
                        </StyledText>
                      </View>
                      <AnimatedSwitch
                        value={enabled}
                        disabled={isSubmitting}
                        accessibilityLabel={t(option.titleKey)}
                        onPress={nextValue => {
                          setFieldValue(
                            `permissions.${option.id}`,
                            Boolean(nextValue),
                          );
                          setFieldTouched(`permissions.${option.id}`, true);
                        }}
                      />
                    </View>
                  );
                })}
              </ScrollView>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  accessibilityRole="button"
                  disabled={isSubmitting}
                  onPress={handleCancel}
                  style={[
                    styles.cancelButton,
                    isSubmitting && styles.disabledButton,
                  ]}>
                  <StyledText
                    color={COLORS.LOGIN_PRIMARY}
                    variant="semiBold"
                    size={14}>
                    {t('STAFF.INVITE.CANCEL')}
                  </StyledText>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  disabled={isSubmitting}
                  onPress={handleSubmit}
                  style={[
                    styles.submitButton,
                    isSubmitting && styles.disabledButton,
                  ]}>
                  {isSubmitting ? (
                    <ActivityIndicator color={COLORS.WHITE} size="small" />
                  ) : (
                    <StyledText
                      color={COLORS.WHITE}
                      variant="semiBold"
                      size={14}>
                      {t(
                        isEditMode
                          ? 'STAFF.EDIT.SAVE'
                          : 'STAFF.INVITE.SUBMIT',
                      )}
                    </StyledText>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </Formik>
      </View>
    </Modal>
  );
};

export default InviteStaffModal;
