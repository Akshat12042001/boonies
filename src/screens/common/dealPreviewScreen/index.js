import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
import {ScreenContainer, StyledText} from '../../../components/atoms';
import {ScreenHeader} from '../../../components/molecules';
import {
  CalendarIcon,
  EmailIcon,
  HomeIcon,
  RupeeIcon,
  StarIcon,
  TrendUpIcon,
  UserOutlineIcon,
} from '../../../components/svgs';
import {makeGetDealRequest} from '../../../api/common';
import {COLORS} from '../../../constants';
import {formatBookingPreviewResponse} from '../../../utils/booking';
import PhotoGalleryModal from './photoGalleryModal';
import {
  AwardIcon,
  GiftIcon,
  GuestsGlyph,
  MoonIcon,
  MountainIcon,
  PlaneIcon,
  ShieldIcon,
} from './previewIcons';
import styles, {AMOUNT_GREEN} from './styles';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
];

const formatStayDate = iso => {
  const parsed = moment(iso);
  if (!parsed.isValid()) {
    return {day: '', weekday: ''};
  }

  return {
    day: `${parsed.date()} ${MONTHS[parsed.month()]}`,
    weekday: parsed.format('ddd'),
  };
};

const countNights = (checkIn, checkOut) => {
  const start = moment(checkIn);
  const end = moment(checkOut);
  if (!start.isValid() || !end.isValid()) {
    return 0;
  }

  return Math.max(0, end.startOf('day').diff(start.startOf('day'), 'days'));
};

const formatAmount = value => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return '₹ 0';
  }

  return `₹ ${Math.round(amount)}`;
};

const SectionTitle = memo(({icon, title}) => (
  <View style={styles.sectionTitle}>
    <View style={styles.sectionTitleIcon}>{icon}</View>
    <StyledText size={15} variant="semiBold" color={COLORS.TEXT}>
      {title}
    </StyledText>
  </View>
));

const StayTile = memo(({icon, label, value, hint, lines, first}) => (
  <View
    style={[
      styles.stayTile,
      first && styles.stayTileFirst,
    ]}>
    {icon}
    <StyledText
      size={11}
      color={COLORS.TEXT_SECONDARY}
      containerStyle={styles.stayLabel}>
      {label}
    </StyledText>
    {value ? (
      <StyledText
        size={14}
        variant="semiBold"
        color={COLORS.TEXT}
        containerStyle={styles.stayValue}>
        {value}
      </StyledText>
    ) : null}
    {hint ? (
      <StyledText
        size={12}
        color={COLORS.TEXT_SECONDARY}
        containerStyle={styles.stayHint}>
        {hint}
      </StyledText>
    ) : null}
    {lines?.map((line, index) => (
      <StyledText
        key={line}
        size={11}
        color={COLORS.TEXT}
        containerStyle={index === 0 ? styles.stayValue : styles.guestLine}>
        {line}
      </StyledText>
    ))}
  </View>
));

const BenefitRow = memo(({Icon, title, body}) => (
  <View style={styles.benefitRow}>
    <View style={styles.benefitIcon}>
      <Icon color="#2F6B3A" size={18} />
    </View>
    <View style={styles.benefitCopy}>
      <StyledText size={14} variant="semiBold" color={COLORS.TEXT}>
        {title}
      </StyledText>
      <StyledText
        size={12}
        color={COLORS.TEXT_SECONDARY}
        containerStyle={styles.benefitBody}>
        {body}
      </StyledText>
    </View>
  </View>
));

const DealPreviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {t} = useTranslation();
  const dealId = route.params?.dealId;
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isGalleryVisible, setIsGalleryVisible] = useState(false);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const loadPreview = useCallback(async () => {
    if (!dealId) {
      setPreview(null);
      setHasError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    try {
      const response = await makeGetDealRequest(dealId);
      const formatted = formatBookingPreviewResponse(response);

      if (!formatted) {
        setPreview(null);
        setHasError(true);
        return;
      }

      setPreview(formatted);
    } catch {
      setPreview(null);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  const checkIn = useMemo(
    () => formatStayDate(preview?.checkIn?.iso),
    [preview?.checkIn?.iso],
  );
  const checkOut = useMemo(
    () => formatStayDate(preview?.checkOut?.iso),
    [preview?.checkOut?.iso],
  );
  const nights = useMemo(
    () => countNights(preview?.checkIn?.iso, preview?.checkOut?.iso),
    [preview?.checkIn?.iso, preview?.checkOut?.iso],
  );
  const images = preview?.propertyImages || [];
  const photoLabel =
    images.length === 1
      ? t('DEALS.PHOTO_COUNT_ONE')
      : t('DEALS.PHOTO_COUNT', {count: images.length});
  const nightsNote =
    nights === 1
      ? t('DEALS.TOTAL_NIGHTS_ONE')
      : t('DEALS.TOTAL_NIGHTS', {count: nights});

  const guestLines = useMemo(() => {
    const adults = preview?.occupancy?.adults || 0;
    const children = preview?.occupancy?.children || 0;
    const pets = preview?.occupancy?.pets || 0;
    const label = (count, oneKey, manyKey) =>
      `${count} ${t(count === 1 ? oneKey : manyKey)}`;

    return [
      label(adults, 'DEALS.ADULT', 'DEALS.ADULT_PLURAL'),
      label(children, 'DEALS.CHILD', 'DEALS.CHILD_PLURAL'),
      label(pets, 'DEALS.PET', 'DEALS.PET_PLURAL'),
    ];
  }, [preview?.occupancy, t]);

  const benefits = useMemo(
    () => [
      {
        id: 'rewards',
        title: t('DEALS.BENEFIT_REWARDS_TITLE'),
        body: t('DEALS.BENEFIT_REWARDS_BODY'),
        Icon: GiftIcon,
      },
      {
        id: 'visibility',
        title: t('DEALS.BENEFIT_VISIBILITY_TITLE'),
        body: t('DEALS.BENEFIT_VISIBILITY_BODY'),
        Icon: TrendUpIcon,
      },
      {
        id: 'host',
        title: t('DEALS.BENEFIT_HOST_TITLE'),
        body: t('DEALS.BENEFIT_HOST_BODY'),
        Icon: AwardIcon,
      },
      {
        id: 'updates',
        title: t('DEALS.BENEFIT_UPDATES_TITLE'),
        body: t('DEALS.BENEFIT_UPDATES_BODY'),
        Icon: PlaneIcon,
      },
      {
        id: 'record',
        title: t('DEALS.BENEFIT_RECORD_TITLE'),
        body: t('DEALS.BENEFIT_RECORD_BODY'),
        Icon: ShieldIcon,
      },
      {
        id: 'reviews',
        title: t('DEALS.BENEFIT_REVIEWS_TITLE'),
        body: t('DEALS.BENEFIT_REVIEWS_BODY'),
        Icon: StarIcon,
      },
    ],
    [t],
  );

  const handleOpenGallery = useCallback(() => {
    if (images.length === 0) {
      return;
    }

    setIsGalleryVisible(true);
  }, [images.length]);

  const handleCloseGallery = useCallback(() => {
    setIsGalleryVisible(false);
  }, []);

  const renderBenefit = useCallback(
    item => (
      <BenefitRow
        key={item.id}
        Icon={item.Icon}
        title={item.title}
        body={item.body}
      />
    ),
    [],
  );

  return (
    <ScreenContainer noPaddingBottom noPaddingTop>
      <ScreenHeader title={t('DEALS.PREVIEW_TITLE')} onBack={handleBack} />
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={COLORS.LOGIN_PRIMARY} size="large" />
        </View>
      ) : null}
      {!isLoading && (hasError || !preview) ? (
        <View style={styles.errorWrap}>
          <StyledText size={14} color={COLORS.TEXT_SECONDARY}>
            {t('DEALS.PREVIEW_LOAD_ERROR')}
          </StyledText>
          <TouchableOpacity style={styles.retry} onPress={loadPreview}>
            <StyledText size={14} variant="semiBold" color={COLORS.WHITE}>
              {t('DEALS.RETRY')}
            </StyledText>
          </TouchableOpacity>
        </View>
      ) : null}
      {!isLoading && preview ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            <View style={styles.section}>
              <SectionTitle
                icon={<UserOutlineIcon size={18} color={COLORS.TEXT} />}
                title={t('DEALS.GUEST_DETAILS')}
              />
              <StyledText
                size={16}
                variant="semiBold"
                color={COLORS.TEXT}
                containerStyle={styles.guestName}>
                {preview.guest?.name}
              </StyledText>
              {preview.guest?.email ? (
                <View style={styles.emailRow}>
                  <View style={styles.emailIcon}>
                    <EmailIcon size={14} color={COLORS.TEXT_SECONDARY} />
                  </View>
                  <StyledText size={13} color={COLORS.TEXT_SECONDARY}>
                    {preview.guest.email}
                  </StyledText>
                </View>
              ) : null}
            </View>

            <View style={styles.section}>
              <SectionTitle
                icon={<CalendarIcon size={18} color={COLORS.TEXT} />}
                title={t('DEALS.BOOKING_DETAILS')}
              />
              <View style={styles.stayRow}>
                <StayTile
                  first
                  icon={<CalendarIcon size={16} color="#4A5C50" />}
                  label={t('DEALS.CHECK_IN')}
                  value={checkIn.day}
                  hint={checkIn.weekday}
                />
                <StayTile
                  icon={<CalendarIcon size={16} color="#4A5C50" />}
                  label={t('DEALS.CHECK_OUT')}
                  value={checkOut.day}
                  hint={checkOut.weekday}
                />
              </View>
              <View style={[styles.stayRow, styles.stayRowSpacing]}>
                <StayTile
                  first
                  icon={<MoonIcon />}
                  label={t('DEALS.NIGHTS')}
                  value={String(nights)}
                  hint={t(nights === 1 ? 'DEALS.NIGHT' : 'DEALS.NIGHT_PLURAL')}
                />
                <StayTile
                  icon={<GuestsGlyph />}
                  label={t('DEALS.GUESTS')}
                  lines={guestLines}
                />
              </View>
            </View>

            <View style={styles.section}>
              <SectionTitle
                icon={<HomeIcon color={COLORS.TEXT} width={18} height={18} />}
                title={t('DEALS.PROPERTY_ROOM')}
              />
              <View style={styles.propertyRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={handleOpenGallery}
                  style={styles.photoPress}>
                  {images[0] ? (
                    <Image
                      source={{uri: images[0]}}
                      style={styles.photo}
                      resizeMode="cover"
                    />
                  ) : null}
                  {images.length > 0 ? (
                    <View style={styles.photoBadgeWrap} pointerEvents="none">
                      <View style={styles.photoBadge}>
                        <StyledText size={11} color={COLORS.WHITE} variant="medium">
                          {photoLabel}
                        </StyledText>
                      </View>
                    </View>
                  ) : null}
                </Pressable>
                <View style={styles.propertyCopy}>
                  <StyledText size={15} variant="semiBold" color={COLORS.TEXT}>
                    {preview.propertyName}
                  </StyledText>
                  {preview.propertyAddress ? (
                    <StyledText
                      size={12}
                      color={COLORS.TEXT_SECONDARY}
                      containerStyle={styles.propertyAddress}>
                      {preview.propertyAddress}
                    </StyledText>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <SectionTitle
                icon={<RupeeIcon size={18} color={COLORS.TEXT} />}
                title={t('DEALS.ADVANCE_PAYMENT')}
              />
              <StyledText size={22} variant="bold" color={AMOUNT_GREEN}>
                {formatAmount(preview.pricing?.advancePayment)}
              </StyledText>
            </View>

            <View style={[styles.section, styles.sectionLast]}>
              <SectionTitle
                icon={<RupeeIcon size={18} color={COLORS.TEXT} />}
                title={t('DEALS.FINAL_AMOUNT')}
              />
              <View style={styles.amountRow}>
                <StyledText size={22} variant="bold" color={AMOUNT_GREEN}>
                  {formatAmount(preview.pricing?.offeredPrice)}
                </StyledText>
                <StyledText
                  size={12}
                  color={COLORS.TEXT_SECONDARY}
                  containerStyle={styles.amountNote}>
                  {nightsNote}
                </StyledText>
              </View>
            </View>
          </View>

          <View style={styles.benefits}>
            <View style={styles.benefitsHeader}>
              <View style={styles.benefitsHeaderIcon}>
                <MountainIcon />
              </View>
              <View style={styles.benefitsFooterCopy}>
                <StyledText size={16} variant="semiBold" color={COLORS.TEXT}>
                  {t('DEALS.WHY_TITLE')}
                </StyledText>
                <StyledText
                  size={12}
                  color={COLORS.TEXT_SECONDARY}
                  containerStyle={styles.benefitsSubtitle}>
                  {t('DEALS.WHY_SUBTITLE')}
                </StyledText>
              </View>
            </View>
            {benefits.map(renderBenefit)}
            <View style={styles.benefitsFooter}>
              <View style={styles.benefitsFooterIcon}>
                <MountainIcon size={16} />
              </View>
              <View style={styles.benefitsFooterCopy}>
                <StyledText size={13} variant="semiBold" color={AMOUNT_GREEN}>
                  {t('DEALS.WHY_FOOTER_TITLE')}
                </StyledText>
                <StyledText
                  size={12}
                  color={COLORS.TEXT_SECONDARY}
                  containerStyle={styles.benefitsFooterBody}>
                  {t('DEALS.WHY_FOOTER_BODY')}
                </StyledText>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : null}

      <PhotoGalleryModal
        isVisible={isGalleryVisible}
        images={images}
        onClose={handleCloseGallery}
      />
    </ScreenContainer>
  );
};

export default DealPreviewScreen;
