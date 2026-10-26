import React, {useCallback, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  ActionLoadingOverlay,
  Input,
  ScreenContainer,
  StyledText,
} from '../../../components/atoms';
import {
  BookingCalendarModal,
  PreviewBookingModal,
} from '../../../components/modals';
import {BookingCard, ScreenHeader} from '../../../components/molecules';
import {
  makeGetBookingPreviewRequest,
  makeGetHostAllBookingsRequest,
} from '../../../api/common';
import {errorToast} from '../../../utils/alerts';
import {formatBookingPreviewResponse} from '../../../utils/booking';
import {mapHostDealsResponse} from '../../../utils/deals';
import {
  getDealSummaryShareTitle,
  shareDealSummary,
} from '../../../utils/shareDealSummary';
import useDebouncedValue from '../../../utils/useDebouncedValue';
import {
  CalendarIcon,
  CheckCircleIcon,
  CloseCircleIcon,
  EyeOpen,
  HourglassIcon,
  ShareIcon,
  TagIcon,
} from '../../../components/svgs';
import {COLORS, NAVIGATION} from '../../../constants';
import styles from './styles';

const DATE_FIELD = {
  CHECK_IN_FROM: 'checkInFrom',
  CHECK_IN_TO: 'checkInTo',
};

const FIELD_BORDER = COLORS.INVOICE_FORM_FIELD_BORDER;
const FIELD_FOCUS = COLORS.LOGIN_PRIMARY;
const PAGE_LIMIT = 5;
const EMPTY_STATS = {total: 0, pending: 0, accepted: 0, rejected: 0};

const formatDisplayDate = date =>
  date ? moment(date).format('DD/MM/YYYY') : '';

const DealsSkeleton = () => (
  <View>
    <View style={styles.row}>
      <View style={styles.statBone} />
      <View style={[styles.statBone, styles.cardSpacing]} />
    </View>
    <View style={[styles.row, styles.rowSpacing]}>
      <View style={styles.statBone} />
      <View style={[styles.statBone, styles.cardSpacing]} />
    </View>
    <View style={styles.filterBone} />
    <View style={styles.dealBone} />
    <View style={styles.dealBone} />
  </View>
);

const DEAL_MENU_ITEMS = [
  {
    action: 'view',
    labelKey: 'DEALS.MENU_VIEW',
    Icon: EyeOpen,
  },
  {
    action: 'preview',
    labelKey: 'DEALS.MENU_PREVIEW',
    Icon: EyeOpen,
  },
  {
    action: 'share',
    labelKey: 'DEALS.MENU_SHARE',
    Icon: ShareIcon,
  },
];

const StatCard = React.memo(
  ({
    label,
    value,
    hint,
    valueColor,
    iconBackground,
    iconColor,
    Icon,
    spaced,
  }) => (
    <View style={[styles.card, spaced && styles.cardSpacing]}>
      <View style={[styles.iconWrap, {backgroundColor: iconBackground}]}>
        <Icon color={iconColor} size={15} />
      </View>
      <StyledText
        color={COLORS.TEXT_SECONDARY}
        size={11}
        lineHeight={14}
        textAlign="center"
        containerStyle={styles.label}
        numberOfLines={1}>
        {label}
      </StyledText>
      <StyledText
        color={valueColor}
        variant="bold"
        size={16}
        lineHeight={20}
        textAlign="center"
        containerStyle={styles.value}>
        {value}
      </StyledText>
      <StyledText
        color={COLORS.TEXT_MUTED}
        size={10}
        lineHeight={13}
        textAlign="center"
        numberOfLines={1}>
        {hint}
      </StyledText>
    </View>
  ),
);

const DealsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [checkInFrom, setCheckInFrom] = useState(null);
  const [checkInTo, setCheckInTo] = useState(null);
  const [activeDateField, setActiveDateField] = useState(null);
  const [deals, setDeals] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isError, setIsError] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [sharingDealId, setSharingDealId] = useState(null);
  const requestIdRef = useRef(0);
  const loadingMoreRef = useRef(false);
  const debouncedSearch = useDebouncedValue(searchQuery, 400);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleOpenCheckInFrom = useCallback(() => {
    setActiveDateField(DATE_FIELD.CHECK_IN_FROM);
  }, []);

  const handleOpenCheckInTo = useCallback(() => {
    setActiveDateField(DATE_FIELD.CHECK_IN_TO);
  }, []);

  const handleDateCancel = useCallback(() => {
    setActiveDateField(null);
  }, []);

  const handleDateClear = useCallback(() => {
    if (activeDateField === DATE_FIELD.CHECK_IN_FROM) {
      setCheckInFrom(null);
    } else if (activeDateField === DATE_FIELD.CHECK_IN_TO) {
      setCheckInTo(null);
    }
    setActiveDateField(null);
  }, [activeDateField]);

  const handleDateConfirm = useCallback(
    date => {
      if (activeDateField === DATE_FIELD.CHECK_IN_FROM) {
        setCheckInFrom(date);
        if (checkInTo && moment(checkInTo).isBefore(date, 'day')) {
          setCheckInTo(null);
        }
      } else if (activeDateField === DATE_FIELD.CHECK_IN_TO) {
        setCheckInTo(date);
      }
      setActiveDateField(null);
    },
    [activeDateField, checkInTo],
  );

  const fetchDeals = useCallback(
    async ({nextPage = 1, append = false} = {}) => {
      if (append && loadingMoreRef.current) {
        return;
      }

      const requestId = ++requestIdRef.current;

      if (append) {
        loadingMoreRef.current = true;
        setIsFetchingMore(true);
      } else {
        setIsLoading(true);
      }
      setIsError(false);

      const params = {page: nextPage, limit: PAGE_LIMIT};
      const trimmedSearch = debouncedSearch.trim();

      if (trimmedSearch) {
        params.search = trimmedSearch;
      }
      if (checkInFrom) {
        params.checkInFrom = moment(checkInFrom).format('YYYY-MM-DD');
      }
      if (checkInTo) {
        params.checkInTo = moment(checkInTo).format('YYYY-MM-DD');
      }

      try {
        const response = await makeGetHostAllBookingsRequest(params);

        if (requestId !== requestIdRef.current) {
          return;
        }

        const mapped = mapHostDealsResponse(response);
        setStats(mapped.stats);
        setPage(mapped.page);
        setTotalPages(mapped.totalPages);
        setDeals(currentDeals =>
          append ? [...currentDeals, ...mapped.deals] : mapped.deals,
        );
      } catch {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setIsError(true);
        if (!append) {
          setDeals([]);
          setStats(EMPTY_STATS);
        }
      } finally {
        if (append) {
          loadingMoreRef.current = false;
        }
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsFetchingMore(false);
          setHasLoadedOnce(true);
        }
      }
    },
    [checkInFrom, checkInTo, debouncedSearch],
  );

  useFocusEffect(
    useCallback(() => {
      fetchDeals({nextPage: 1});
    }, [fetchDeals]),
  );

  const handleLoadMore = useCallback(() => {
    if (isLoading || isFetchingMore || page >= totalPages) {
      return;
    }

    fetchDeals({nextPage: page + 1, append: true});
  }, [fetchDeals, isFetchingMore, isLoading, page, totalPages]);

  const showInitialSkeleton = isLoading && !hasLoadedOnce;

  const rows = useMemo(
    () => [
      [
        {
          id: 'total',
          label: t('DEALS.TOTAL'),
          value: String(stats.total),
          hint: t('DEALS.TOTAL_HINT'),
          valueColor: '#2F6FE0',
          iconBackground: '#E7F0FF',
          iconColor: '#3B82F6',
          Icon: TagIcon,
        },
        {
          id: 'pending',
          label: t('DEALS.PENDING'),
          value: String(stats.pending),
          hint: t('DEALS.PENDING_HINT'),
          valueColor: COLORS.TEXT,
          iconBackground: '#FFF6D8',
          iconColor: '#C9A227',
          Icon: HourglassIcon,
        },
      ],
      [
        {
          id: 'accepted',
          label: t('DEALS.ACCEPTED'),
          value: String(stats.accepted),
          hint: t('DEALS.ACCEPTED_HINT'),
          valueColor: '#2F8F4E',
          iconBackground: '#E7F6EC',
          iconColor: '#3C9A5A',
          Icon: CheckCircleIcon,
        },
        {
          id: 'rejected',
          label: t('DEALS.REJECTED'),
          value: String(stats.rejected),
          hint: t('DEALS.REJECTED_HINT'),
          valueColor: '#E07A2F',
          iconBackground: '#FFF1E6',
          iconColor: '#E08A3C',
          Icon: CloseCircleIcon,
        },
      ],
    ],
    [stats.accepted, stats.pending, stats.rejected, stats.total, t],
  );

  const handleClosePreview = useCallback(() => {
    setIsPreviewVisible(false);
    setPreviewData(null);
    setPreviewTitle('');
    setIsPreviewLoading(false);
  }, []);

  const handleOpenPreview = useCallback(async (dealId, fallbackTitle = '') => {
    setPreviewTitle(fallbackTitle);
    setPreviewData(null);
    setTimeout(() => {
      setIsPreviewVisible(true);
      setIsPreviewLoading(true);
    }, 500);

    try {
      const response = await makeGetBookingPreviewRequest(dealId);
      setPreviewData(formatBookingPreviewResponse(response));
    } catch {
      setIsPreviewVisible(false);
      setPreviewData(null);
      setPreviewTitle('');
    } finally {
      setIsPreviewLoading(false);
    }
  }, []);

  const handleShareDeal = useCallback(
    async (dealId, fallbackTitle = '') => {
      if (sharingDealId) {
        return;
      }

      try {
        setSharingDealId(dealId);
        const response = await makeGetBookingPreviewRequest(dealId);
        const data = formatBookingPreviewResponse(response);

        if (!data) {
          errorToast(t('BOOKING_LIST.SHARE_FAILED'));
          return;
        }

        await shareDealSummary(
          data,
          getDealSummaryShareTitle(
            data.guest?.name,
            data.propertyName || fallbackTitle,
          ),
        );
      } catch (error) {
        if (!error?.response) {
          errorToast(t('BOOKING_LIST.SHARE_FAILED'));
        }
      } finally {
        setSharingDealId(null);
      }
    },
    [sharingDealId, t],
  );

  const handleCardPress = useCallback(
    dealId => {
      const deal = deals.find(item => String(item.id) === String(dealId));
      handleOpenPreview(dealId, deal?.homestayTitle || '');
    },
    [deals, handleOpenPreview],
  );

  const handleMenuAction = useCallback(
    (action, dealId) => {
      const deal = deals.find(item => String(item.id) === String(dealId));
      const fallbackTitle = deal?.homestayTitle || '';

      if (action === 'view') {
        navigation.navigate(NAVIGATION.COMMON.DEAL_PREVIEW_SCREEN, {dealId});
        return;
      }

      if (action === 'preview') {
        handleOpenPreview(dealId, fallbackTitle);
        return;
      }

      if (action === 'share') {
        handleShareDeal(dealId, fallbackTitle);
      }
    },
    [deals, handleOpenPreview, handleShareDeal, navigation],
  );

  return (
    <ScreenContainer noPaddingBottom noPaddingTop>
      <ScreenHeader
        title="My offers"
        subtitle="Every deal you're negotiating or have closed — as guest and as host."
        onBack={handleBack}
      />
      <KeyboardAwareScrollView
        enableOnAndroid
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScroll={({nativeEvent}) => {
          const {layoutMeasurement, contentOffset, contentSize} = nativeEvent;
          const distanceFromBottom =
            contentSize.height - (layoutMeasurement.height + contentOffset.y);

          if (distanceFromBottom < 80) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={200}
        contentContainerStyle={[
          styles.content,
          {paddingBottom: (insets.bottom || 16) + 16},
        ]}>
        {showInitialSkeleton ? <DealsSkeleton /> : null}
        {!showInitialSkeleton &&
          rows.map((row, rowIndex) => (
            <View
              key={row[0].id}
              style={[styles.row, rowIndex > 0 && styles.rowSpacing]}>
              {row.map((card, cardIndex) => (
                <StatCard key={card.id} {...card} spaced={cardIndex > 0} />
              ))}
            </View>
          ))}

        {!showInitialSkeleton ? (
          <View style={styles.filters}>
            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('DEALS.SEARCH_PLACEHOLDER')}
              containerStyles={styles.searchField}
              borderColor={FIELD_BORDER}
              focusedBorderColor={FIELD_FOCUS}
            />
            <View style={styles.dateRow}>
              <Input
                label={t('BOOKING_LIST.CHECK_IN_FROM')}
                value={formatDisplayDate(checkInFrom)}
                placeholder={t('BOOKING_LIST.DATE_PLACEHOLDER')}
                rightIcon={<CalendarIcon />}
                editable={false}
                onPress={handleOpenCheckInFrom}
                onRightIconPress={handleOpenCheckInFrom}
                containerStyles={[styles.dateField]}
                borderColor={FIELD_BORDER}
                focusedBorderColor={FIELD_FOCUS}
              />
              <Input
                label={t('BOOKING_LIST.CHECK_IN_TO')}
                value={formatDisplayDate(checkInTo)}
                placeholder={t('BOOKING_LIST.DATE_PLACEHOLDER')}
                rightIcon={<CalendarIcon />}
                editable={false}
                onPress={handleOpenCheckInTo}
                onRightIconPress={handleOpenCheckInTo}
                containerStyles={[styles.dateField, styles.dateFieldSpacing]}
                borderColor={FIELD_BORDER}
                focusedBorderColor={FIELD_FOCUS}
              />
            </View>
          </View>
        ) : null}

        {!showInitialSkeleton && isLoading ? (
          <>
            <View style={styles.dealBone} />
            <View style={styles.dealBone} />
          </>
        ) : null}

        {!showInitialSkeleton &&
          !isLoading &&
          deals.map(deal => (
            <View key={deal.id} style={styles.dealCard}>
              <BookingCard
                id={deal.id}
                homestayTitle={deal.homestayTitle}
                guestName={t(
                  deal.guestRole === 'guest'
                    ? 'DEALS.BY_GUEST'
                    : 'DEALS.BY_HOST',
                )}
                checkIn={deal.checkIn}
                checkOut={deal.checkOut}
                offeredPrice={deal.offeredPrice}
                adults={deal.adults}
                status={deal.status}
                menuItems={DEAL_MENU_ITEMS}
                onPress={handleCardPress}
                onMenuAction={handleMenuAction}
              />
            </View>
          ))}

        {!showInitialSkeleton && !isLoading && deals.length === 0 ? (
          <StyledText
            color={COLORS.TEXT_SECONDARY}
            size={13}
            textAlign="center"
            containerStyle={styles.empty}>
            {t(isError ? 'DEALS.LOAD_ERROR' : 'DEALS.EMPTY')}
          </StyledText>
        ) : null}

        {isFetchingMore ? (
          <View style={styles.paginationLoader}>
            <ActivityIndicator color={COLORS.LOGIN_PRIMARY} />
          </View>
        ) : null}
      </KeyboardAwareScrollView>

      <ActionLoadingOverlay visible={!!sharingDealId} />

      <PreviewBookingModal
        data={previewData}
        fallbackTitle={previewTitle}
        isLoading={isPreviewLoading}
        isVisible={isPreviewVisible}
        onClose={handleClosePreview}
      />

      <BookingCalendarModal
        isVisible={!!activeDateField}
        title={
          activeDateField === DATE_FIELD.CHECK_IN_TO
            ? t('BOOKING_LIST.CHECK_IN_TO')
            : t('BOOKING_LIST.CHECK_IN_FROM')
        }
        selectedDate={
          activeDateField === DATE_FIELD.CHECK_IN_TO ? checkInTo : checkInFrom
        }
        allowAnyDate
        unavailableDates={[]}
        useClearAction
        onConfirm={handleDateConfirm}
        onClear={handleDateClear}
        onClose={handleDateCancel}
      />
    </ScreenContainer>
  );
};

export default DealsScreen;
