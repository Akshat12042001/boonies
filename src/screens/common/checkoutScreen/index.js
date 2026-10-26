import React, {useCallback, useMemo} from 'react';
import {Image, Linking, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {Formik} from 'formik';
import moment from 'moment';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Input, ScreenContainer, StyledText} from '../../../components/atoms';
import {ScreenHeader} from '../../../components/molecules';
import {TruckIcon} from '../../../components/svgs';
import {COLORS, FORM_SCHEMA} from '../../../constants';
import {makeGetHostListingsDropdownRequest} from '../../../api/common';
import {selectCartItems} from '../../../redux/cart/cart.reducer';
import {errorToast} from '../../../utils/alerts';
import {formatCurrency, formatCurrencyWithDecimals} from '../../../utils/invoice';
import styles from './styles';

const SGST_RATE = 0.025;
const CGST_RATE = 0.025;
const FIELD_BORDER = COLORS.INVOICE_FORM_FIELD_BORDER;
const FIELD_FOCUS = COLORS.LOGIN_PRIMARY;
const ORDER_WHATSAPP_NUMBER = '917986302602';

const lineAmount = item =>
  (Number(item.price) || 0) * (Number(item.quantity) || 0);

const displayValue = value => {
  const text = String(value || '').trim();
  return text || '-';
};

const getHostName = user =>
  [user?.firstName, user?.lastName].filter(Boolean).join(' ');

const getHostPhone = user => user?.phone || user?.mobile || user?.phoneNumber;

const getHomestayName = response => {
  const listings = Array.isArray(response?.data) ? response.data : [];

  return listings
    .map(listing => listing?.title || listing?.name)
    .filter(Boolean)
    .join(', ');
};

const buildOrderWhatsAppMessage = ({values, items, summary, host}) => {
  const itemLines = items.flatMap((item, index) => {
    const lines = [
      ` ${item.title}`,
      `   Qty: ${item.quantity}`,
      `   Price: ${formatCurrencyWithDecimals(item.price)}`,
      `   Amount: ${formatCurrencyWithDecimals(lineAmount(item))}`,
    ];

    if (index < items.length - 1) {
      lines.push('');
    }

    return lines;
  });

  return [
    '🛒 New Boonies Order',
    `Date: ${moment().format('D MMM YYYY, h:mm A')}`,
    '',
    'Host details',
    `Name: ${displayValue(host.name)}`,
    `Phone: ${displayValue(host.phone)}`,
    `Homestay: ${displayValue(host.homestayName)}`,
    '',
    'Shipping details',
    `Name: ${values.fullName.trim()}`,
    `Phone: ${values.phone.trim()}`,
    `Address: ${values.address.trim()}`,
    `City: ${values.city.trim()}`,
    `State: ${values.state.trim()}`,
    `Pincode: ${values.postalCode.trim()}`,
    '',
    'Order summary',
    ...itemLines,
    '',
    `Subtotal: ${formatCurrencyWithDecimals(summary.subtotal)}`,
    `SGST (2.5%): ${formatCurrencyWithDecimals(summary.sgst)}`,
    `CGST (2.5%): ${formatCurrencyWithDecimals(summary.cgst)}`,
    `Total: ${formatCurrencyWithDecimals(summary.total)}`,
    '',
    'Payment: Pending',
    `Notes: ${displayValue(values.orderNotes)}`,
  ].join('\n');
};

const INITIAL_VALUES = {
  fullName: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  landmark: '',
  orderNotes: '',
};

const digitsOnly = (value, maxLength) =>
  String(value || '')
    .replace(/\D/g, '')
    .slice(0, maxLength);

const roundMoney = value => Math.round((Number(value) || 0) * 100) / 100;

const CheckoutScreen = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const cartItems = useSelector(selectCartItems);
  const user = useSelector(state => state.auth.user);

  const summary = useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
      0,
    );
    const sgst = roundMoney(subtotal * SGST_RATE);
    const cgst = roundMoney(subtotal * CGST_RATE);

    return {
      subtotal: roundMoney(subtotal),
      sgst,
      cgst,
      total: roundMoney(subtotal + sgst + cgst),
    };
  }, [cartItems]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSubmit = useCallback(
    async values => {
      if (!cartItems.length) {
        errorToast(t('CHECKOUT.EMPTY_CART'));
        return;
      }

      let homestayName = '';

      try {
        const listingsResponse = await makeGetHostListingsDropdownRequest({
          page: 1,
          limit: 100,
        });
        homestayName = getHomestayName(listingsResponse);
      } catch {
        homestayName = '';
      }

      const message = buildOrderWhatsAppMessage({
        values,
        items: cartItems,
        summary,
        host: {
          name: getHostName(user),
          phone: getHostPhone(user),
          homestayName,
        },
      });
      const url = `https://wa.me/${ORDER_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      try {
        await Linking.openURL(url);
      } catch {
        errorToast(t('CHECKOUT.WHATSAPP_FAILED'));
      }
    },
    [cartItems, summary, t, user],
  );

  return (
    <ScreenContainer noPaddingTop noPaddingBottom>
      <ScreenHeader
        title={t('CHECKOUT.TITLE')}
        backAccessibilityLabel={t('CHECKOUT.BACK')}
        onBack={handleBack}
      />
      <Formik
        validateOnChange
        initialValues={INITIAL_VALUES}
        validationSchema={FORM_SCHEMA.CHECKOUT.schema}
        onSubmit={handleSubmit}>
        {({
          handleBlur,
          handleChange,
          handleSubmit: submitForm,
          setFieldValue,
          values,
          errors,
          touched,
        }) => {
          const handlePhoneChange = value => {
            setFieldValue('phone', digitsOnly(value, 10), true);
          };

          const handlePostalCodeChange = value => {
            setFieldValue('postalCode', digitsOnly(value, 6), true);
          };

          return (
            <KeyboardAwareScrollView
              enableOnAndroid
              extraScrollHeight={24}
              keyboardShouldPersistTaps="handled"
              style={styles.flex}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}>
              <View style={styles.card}>
                <View style={styles.sectionHeader}>
                  <TruckIcon color={COLORS.TEXT} size={18} />
                  <StyledText variant="bold" size={16}>
                    {t('CHECKOUT.SHIPPING_DETAILS')}
                  </StyledText>
                </View>

                <View style={styles.fieldRow}>
                  <Input
                    required
                    label={t('CHECKOUT.FULL_NAME')}
                    value={values.fullName}
                    placeholder={t('CHECKOUT.FULL_NAME_PLACEHOLDER')}
                    onBlur={handleBlur('fullName')}
                    onChangeText={handleChange('fullName')}
                    error={touched.fullName && errors.fullName}
                    containerStyles={styles.field}
                    borderColor={FIELD_BORDER}
                    focusedBorderColor={FIELD_FOCUS}
                  />
                  <Input
                    required
                    label={t('CHECKOUT.PHONE')}
                    value={values.phone}
                    placeholder={t('CHECKOUT.PHONE_PLACEHOLDER')}
                    keyboardType="phone-pad"
                    maxLength={10}
                    onBlur={handleBlur('phone')}
                    onChangeText={handlePhoneChange}
                    error={touched.phone && errors.phone}
                    containerStyles={styles.field}
                    borderColor={FIELD_BORDER}
                    focusedBorderColor={FIELD_FOCUS}
                  />
                </View>

                <Input
                  required
                  label={t('CHECKOUT.ADDRESS')}
                  value={values.address}
                  placeholder={t('CHECKOUT.ADDRESS_PLACEHOLDER')}
                  onBlur={handleBlur('address')}
                  onChangeText={handleChange('address')}
                  error={touched.address && errors.address}
                  containerStyles={styles.fieldSpacing}
                  borderColor={FIELD_BORDER}
                  focusedBorderColor={FIELD_FOCUS}
                />

                <Input
                  required
                  label={t('CHECKOUT.CITY')}
                  value={values.city}
                  placeholder={t('CHECKOUT.CITY_PLACEHOLDER')}
                  onBlur={handleBlur('city')}
                  onChangeText={handleChange('city')}
                  error={touched.city && errors.city}
                  containerStyles={styles.fieldSpacing}
                  borderColor={FIELD_BORDER}
                  focusedBorderColor={FIELD_FOCUS}
                />
                <Input
                  required
                  label={t('CHECKOUT.STATE')}
                  value={values.state}
                  placeholder={t('CHECKOUT.STATE_PLACEHOLDER')}
                  onBlur={handleBlur('state')}
                  onChangeText={handleChange('state')}
                  error={touched.state && errors.state}
                  containerStyles={styles.fieldSpacing}
                  borderColor={FIELD_BORDER}
                  focusedBorderColor={FIELD_FOCUS}
                />
                <Input
                  required
                  label={t('CHECKOUT.POSTAL_CODE')}
                  value={values.postalCode}
                  placeholder={t('CHECKOUT.POSTAL_CODE_PLACEHOLDER')}
                  keyboardType="number-pad"
                  maxLength={6}
                  onBlur={handleBlur('postalCode')}
                  onChangeText={handlePostalCodeChange}
                  error={touched.postalCode && errors.postalCode}
                  containerStyles={styles.fieldSpacing}
                  borderColor={FIELD_BORDER}
                  focusedBorderColor={FIELD_FOCUS}
                />

                <Input
                  label={t('CHECKOUT.LANDMARK')}
                  value={values.landmark}
                  placeholder={t('CHECKOUT.LANDMARK_PLACEHOLDER')}
                  onBlur={handleBlur('landmark')}
                  onChangeText={handleChange('landmark')}
                  error={touched.landmark && errors.landmark}
                  containerStyles={styles.fieldSpacing}
                  borderColor={FIELD_BORDER}
                  focusedBorderColor={FIELD_FOCUS}
                />

                <Input
                  label={t('CHECKOUT.ORDER_NOTES')}
                  value={values.orderNotes}
                  placeholder={t('CHECKOUT.ORDER_NOTES_PLACEHOLDER')}
                  onBlur={handleBlur('orderNotes')}
                  onChangeText={handleChange('orderNotes')}
                  error={touched.orderNotes && errors.orderNotes}
                  multiline
                  numberOfLines={3}
                  inputStyle={styles.notesInput}
                  containerStyles={styles.field}
                  borderColor={FIELD_BORDER}
                  focusedBorderColor={FIELD_FOCUS}
                />
              </View>

              <View style={[styles.card, styles.summaryCard]}>
                <StyledText
                  variant="bold"
                  size={16}
                  containerStyle={styles.summaryTitle}>
                  {t('CHECKOUT.ORDER_SUMMARY')}
                </StyledText>

                {cartItems.length === 0 ? (
                  <StyledText
                    color={COLORS.TEXT_SECONDARY}
                    size={13}
                    containerStyle={styles.summaryTitle}>
                    {t('CART.EMPTY')}
                  </StyledText>
                ) : null}
                {cartItems.map(item => (
                  <View key={item.id} style={styles.productRow}>
                    {item.imageUrl ? (
                      <Image
                        source={{uri: item.imageUrl}}
                        style={styles.productImage}
                      />
                    ) : (
                      <View style={styles.productImagePlaceholder} />
                    )}
                    <View style={styles.productCopy}>
                      <StyledText variant="semiBold" size={13} numberOfLines={1}>
                        {item.title}
                      </StyledText>
                      <StyledText color={COLORS.TEXT_SECONDARY} size={12}>
                        {t('CHECKOUT.QUANTITY', {
                          price: formatCurrency(item.price),
                          quantity: item.quantity,
                        })}
                      </StyledText>
                    </View>
                    <StyledText variant="semiBold" size={13}>
                      {formatCurrency(
                        (Number(item.price) || 0) * (Number(item.quantity) || 0),
                      )}
                    </StyledText>
                  </View>
                ))}

                <View style={styles.summaryRow}>
                  <StyledText color={COLORS.TEXT_SECONDARY} size={13}>
                    {t('CHECKOUT.SUBTOTAL')}
                  </StyledText>
                  <StyledText size={13}>{formatCurrency(summary.subtotal)}</StyledText>
                </View>
                <View style={styles.summaryRow}>
                  <StyledText color={COLORS.TEXT_SECONDARY} size={13}>
                    {t('CHECKOUT.SGST')}
                  </StyledText>
                  <StyledText size={13}>{formatCurrency(summary.sgst)}</StyledText>
                </View>
                <View style={styles.summaryRow}>
                  <StyledText color={COLORS.TEXT_SECONDARY} size={13}>
                    {t('CHECKOUT.CGST')}
                  </StyledText>
                  <StyledText size={13}>{formatCurrency(summary.cgst)}</StyledText>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <StyledText variant="bold" size={15}>
                    {t('CHECKOUT.TOTAL')}
                  </StyledText>
                  <StyledText color={COLORS.LOGIN_PRIMARY} variant="bold" size={15}>
                    {formatCurrency(summary.total)}
                  </StyledText>
                </View>

                <TouchableOpacity
                  accessibilityRole="button"
                  activeOpacity={0.9}
                  onPress={submitForm}
                  style={styles.placeOrderButton}>
                  <StyledText color={COLORS.WHITE} variant="semiBold" size={15}>
                    {t('CHECKOUT.PLACE_ORDER')}
                  </StyledText>
                </TouchableOpacity>
              </View>
            </KeyboardAwareScrollView>
          );
        }}
      </Formik>
    </ScreenContainer>
  );
};

export default CheckoutScreen;
