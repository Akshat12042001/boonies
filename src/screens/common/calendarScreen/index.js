import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Image, ScrollView, TouchableOpacity, View} from 'react-native';
import moment from 'moment';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Skeleton from 'react-native-reanimated-skeleton';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ScreenContainer, StyledText} from '../../../components/atoms';
import {
  AddOffSeasonPeriodModal,
  DeleteBlockedEntryModal,
  DeleteOffSeasonPeriodModal,
  PreviewBookingModal,
} from '../../../components/modals';
import {
  AvailabilityCalendar,
  BlockedEntriesCard,
  CalendarBookingCard,
  CalendarSelectionCard,
  ScreenHeader,
} from '../../../components/molecules';
import {
  EditIcon,
  InfoIcon,
  LocationPinIcon,
  PlusIcon,
  TrashIcon,
} from '../../../components/svgs';
import {
  makeCreateHomestayBlockedDatesRequest,
  makeCreateOffSeasonPeriodRequest,
  makeDeleteBlockedDateRequest,
  makeDeleteOffSeasonPeriodRequest,
  makeGetBookingPreviewRequest,
  makeGetHomestayBlockedDatesRequest,
  makeGetHostCalendarBookingsRequest,
  makeGetOffSeasonPeriodsRequest,
  makeUpdateOffSeasonPeriodRequest,
} from '../../../api/common';
import {COLORS, SCREEN} from '../../../constants';
import {errorToast, successToast} from '../../../utils/alerts';
import {
  useGetMyPropertiesQuery,
  useGetPropertyDetailQuery,
} from '../../../redux/tabs';
import {formatBookingPreviewResponse} from '../../../utils/booking';
import {
  formatOffSeasonPeriodLabel,
  getBlockedDayStatuses,
  getBlockedEntriesStats,
  getHomestayBlockedEntries,
  getHostCalendarBookings,
  getOffSeasonPeriods,
  getTodayCalendarString,
  hasOffSeasonPrices,
  isUnavailableCalendarDate,
  mergeCalendarDayStatuses,
  rangeHasUnavailableDate,
} from '../../../utils/calendar';
import {
  formatPropertyLocation,
  getProperties,
} from '../../../utils/property';
import {getPropertyDetailData} from '../../../utils/propertyDetail';
import styles from './styles';

const TAB = {
  AVAILABILITY: 'availability',
  OFF_SEASON: 'offSeason',
};

const CONTENT_WIDTH = SCREEN.WIDTH - 32;

const CALENDAR_SKELETON_LAYOUT = [
  {key: 'selector', width: CONTENT_WIDTH, height: 88, borderRadius: 16},
  {
    key: 'detail',
    width: CONTENT_WIDTH,
    height: 148,
    borderRadius: 16,
    marginTop: 12,
  },
  {
    key: 'tabs',
    width: CONTENT_WIDTH * 0.7,
    height: 22,
    borderRadius: 6,
    marginTop: 16,
  },
  {
    key: 'calendar',
    width: CONTENT_WIDTH,
    height: 360,
    borderRadius: 16,
    marginTop: 14,
  },
  {
    key: 'selection',
    width: CONTENT_WIDTH,
    height: 120,
    borderRadius: 18,
    marginTop: 12,
  },
  {
    key: 'blocked',
    width: CONTENT_WIDTH,
    height: 220,
    borderRadius: 16,
    marginTop: 12,
  },
];

const BLOCKED_ENTRIES_SKELETON_LAYOUT = [
  {
    key: 'blocked-card',
    width: CONTENT_WIDTH,
    height: 220,
    borderRadius: 16,
  },
];

const STAT_COLORS = {
  blocks: COLORS.TEXT,
  manual: '#D4920A',
  recurring: '#7B5EA7',
  booked: '#E05A6A',
};

const isActiveProperty = property =>
  String(property?.status || '').toLowerCase() === 'active';

const formatNightlyPrice = value => {
  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return '₹0';
  }
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const CalendarScreen = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    data: propertiesResponse,
    isError,
    isLoading,
    isFetching,
    refetch,
  } = useGetMyPropertiesQuery({page: 1, limit: 200});

  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [activeTab, setActiveTab] = useState(TAB.AVAILABILITY);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    moment().startOf('month').toDate(),
  );
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [blockedEntries, setBlockedEntries] = useState([]);
  const [isBlockedEntriesLoading, setIsBlockedEntriesLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingEntryId, setDeletingEntryId] = useState(null);
  const [isBlockingDates, setIsBlockingDates] = useState(false);
  const [isAddOffSeasonVisible, setIsAddOffSeasonVisible] = useState(false);
  const [isAddingOffSeason, setIsAddingOffSeason] = useState(false);
  const [offSeasonModalError, setOffSeasonModalError] = useState('');
  const [editingOffSeasonPeriod, setEditingOffSeasonPeriod] = useState(null);
  const [deleteOffSeasonTarget, setDeleteOffSeasonTarget] = useState(null);
  const [isDeletingOffSeason, setIsDeletingOffSeason] = useState(false);
  const [deleteOffSeasonError, setDeleteOffSeasonError] = useState('');
  const [offSeasonPeriods, setOffSeasonPeriods] = useState([]);
  const [isOffSeasonPeriodsLoading, setIsOffSeasonPeriodsLoading] =
    useState(false);
  const [calendarBookings, setCalendarBookings] = useState([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const bookingsPropertyIdRef = useRef(null);

  const properties = useMemo(
    () => getProperties(propertiesResponse).filter(isActiveProperty),
    [propertiesResponse],
  );

  const hasActiveProperty = properties.length > 0;

  const selectedProperty = useMemo(() => {
    if (!properties.length) {
      return null;
    }
    return (
      properties.find(item => item.id === selectedPropertyId) || properties[0]
    );
  }, [properties, selectedPropertyId]);

  const {
    data: propertyDetailResponse,
    isFetching: isPropertyDetailFetching,
    refetch: refetchPropertyDetail,
  } = useGetPropertyDetailQuery(selectedProperty?.id, {
    skip: !selectedProperty?.id,
  });

  const propertyDetail = useMemo(
    () => getPropertyDetailData(propertyDetailResponse),
    [propertyDetailResponse],
  );

  const canManageOffSeason = hasOffSeasonPrices(propertyDetail);

  const isPropertyContentLoading =
    !!selectedProperty?.id &&
    (isBlockedEntriesLoading ||
      isBookingsLoading ||
      isOffSeasonPeriodsLoading ||
      (isPropertyDetailFetching && !propertyDetailResponse));

  const showInitialSkeleton =
    isLoading ||
    (isFetching && !propertiesResponse) ||
    isPropertyContentLoading;

  const showBlockedSkeleton = isBlockedEntriesLoading;

  const blockedDayStatuses = useMemo(
    () =>
      mergeCalendarDayStatuses(
        getBlockedDayStatuses(blockedEntries),
        calendarBookings,
      ),
    [blockedEntries, calendarBookings],
  );

  const blockedStats = useMemo(
    () => getBlockedEntriesStats(blockedEntries, calendarBookings.length),
    [blockedEntries, calendarBookings.length],
  );

  const selectedBooking = useMemo(
    () =>
      calendarBookings.find(booking => booking.id === selectedBookingId) ||
      null,
    [calendarBookings, selectedBookingId],
  );

  useEffect(() => {
    if (selectedBookingId && !selectedBooking) {
      setSelectedBookingId(null);
    }
  }, [selectedBooking, selectedBookingId]);

  const fetchBlockedEntries = useCallback(async homestayId => {
    if (!homestayId) {
      setBlockedEntries([]);
      return;
    }

    try {
      setIsBlockedEntriesLoading(true);
      const response = await makeGetHomestayBlockedDatesRequest(homestayId);
      setBlockedEntries(getHomestayBlockedEntries(response));
    } catch {
      setBlockedEntries([]);
    } finally {
      setIsBlockedEntriesLoading(false);
    }
  }, []);

  const fetchOffSeasonPeriods = useCallback(async homestayId => {
    if (!homestayId) {
      setOffSeasonPeriods([]);
      return;
    }

    try {
      setIsOffSeasonPeriodsLoading(true);
      const response = await makeGetOffSeasonPeriodsRequest(homestayId);
      setOffSeasonPeriods(getOffSeasonPeriods(response));
    } catch {
      setOffSeasonPeriods([]);
    } finally {
      setIsOffSeasonPeriodsLoading(false);
    }
  }, []);

  const fetchPropertyBookings = useCallback(
    async (homestayId, bookingMonth, {showLoader = true} = {}) => {
      if (!homestayId || !bookingMonth) {
        setCalendarBookings([]);
        return;
      }

      try {
        if (showLoader) {
          setIsBookingsLoading(true);
          setCalendarBookings([]);
        }
        const response = await makeGetHostCalendarBookingsRequest(
          homestayId,
          bookingMonth,
        );
        setCalendarBookings(getHostCalendarBookings(response));
      } catch {
        setCalendarBookings([]);
      } finally {
        if (showLoader) {
          setIsBookingsLoading(false);
        }
      }
    },
    [],
  );

  const bookingMonth = useMemo(
    () => moment(visibleMonth).format('YYYY-MM'),
    [visibleMonth],
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
      if (selectedProperty?.id) {
        refetchPropertyDetail();
      }
    }, [refetch, refetchPropertyDetail, selectedProperty?.id]),
  );

  useEffect(() => {
    if (!properties.length) {
      if (selectedPropertyId) {
        setSelectedPropertyId(null);
      }
      return;
    }

    const stillExists = properties.some(item => item.id === selectedPropertyId);
    if (!stillExists) {
      setSelectedPropertyId(properties[0].id);
      setStartDate(null);
      setEndDate(null);
      setBlockReason('');
    }
  }, [properties, selectedPropertyId]);

  useEffect(() => {
    if (!selectedProperty?.id) {
      setBlockedEntries([]);
      setOffSeasonPeriods([]);
      setCalendarBookings([]);
      setIsBookingsLoading(false);
      return;
    }

    fetchBlockedEntries(selectedProperty.id);
    fetchOffSeasonPeriods(selectedProperty.id);
  }, [
    fetchBlockedEntries,
    fetchOffSeasonPeriods,
    selectedProperty?.id,
  ]);

  useEffect(() => {
    if (!selectedProperty?.id || !bookingMonth) {
      setCalendarBookings([]);
      setIsBookingsLoading(false);
      bookingsPropertyIdRef.current = null;
      return;
    }

    const shouldShowLoader =
      bookingsPropertyIdRef.current !== selectedProperty.id;
    bookingsPropertyIdRef.current = selectedProperty.id;

    fetchPropertyBookings(selectedProperty.id, bookingMonth, {
      showLoader: shouldShowLoader,
    });
  }, [bookingMonth, fetchPropertyBookings, selectedProperty?.id]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSelectProperty = useCallback(id => {
    setSelectedPropertyId(id);
    setStartDate(null);
    setEndDate(null);
    setBlockReason('');
    setSelectedBookingId(null);
  }, []);

  const handleClearSelection = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
    setBlockReason('');
  }, []);

  const handleClearSelectedBooking = useCallback(() => {
    setSelectedBookingId(null);
  }, []);

  const handlePressBooking = useCallback(bookingId => {
    setSelectedBookingId(bookingId);
    setStartDate(null);
    setEndDate(null);
    setBlockReason('');
  }, []);

  const handleClosePreviewModal = useCallback(() => {
    setIsPreviewVisible(false);
    setPreviewData(null);
    setPreviewTitle('');
    setIsPreviewLoading(false);
  }, []);

  const handleViewBooking = useCallback(
    async bookingId => {
      if (!bookingId || isPreviewLoading) {
        return;
      }

      const booking = calendarBookings.find(item => item.id === bookingId);
      setPreviewTitle(selectedProperty?.title || '');
      setPreviewData(null);
      setIsPreviewVisible(true);
      setIsPreviewLoading(true);

      try {
        const response = await makeGetBookingPreviewRequest(bookingId);
        setPreviewData(formatBookingPreviewResponse(response));
        if (booking?.guestName) {
          setPreviewTitle(booking.guestName);
        }
      } catch {
        setIsPreviewVisible(false);
        setPreviewData(null);
        setPreviewTitle('');
      } finally {
        setIsPreviewLoading(false);
      }
    },
    [calendarBookings, isPreviewLoading, selectedProperty?.title],
  );

  const handleSelectDate = useCallback(
    dateString => {
      if (isUnavailableCalendarDate(dateString, blockedDayStatuses)) {
        return;
      }

      setSelectedBookingId(null);

      if (!startDate || (startDate && endDate)) {
        setStartDate(dateString);
        setEndDate(null);
        setBlockReason('');
        return;
      }

      if (dateString < startDate) {
        if (rangeHasUnavailableDate(dateString, startDate, blockedDayStatuses)) {
          errorToast(t('CALENDAR.RANGE_INCLUDES_UNAVAILABLE'));
          return;
        }
        setStartDate(dateString);
        setEndDate(null);
        return;
      }

      if (dateString === startDate) {
        setEndDate(dateString);
        return;
      }

      if (rangeHasUnavailableDate(startDate, dateString, blockedDayStatuses)) {
        errorToast(t('CALENDAR.RANGE_INCLUDES_UNAVAILABLE'));
        return;
      }

      setEndDate(dateString);
    },
    [blockedDayStatuses, endDate, startDate, t],
  );

  const handlePressToday = useCallback(() => {
    const todayString = getTodayCalendarString();
    setVisibleMonth(moment(todayString).startOf('month').toDate());
  }, []);

  const handleBlockDates = useCallback(async () => {
    const homestayId = selectedProperty?.id;

    if (!homestayId || !startDate || !endDate || isBlockingDates) {
      return;
    }

    try {
      setIsBlockingDates(true);
      const payload = {
        blockType: 'manual',
        startDate,
        endDate,
      };
      const reason = String(blockReason || '').trim();
      if (reason) {
        payload.reason = reason;
      }

      const response = await makeCreateHomestayBlockedDatesRequest(
        homestayId,
        payload,
      );
      successToast(response?.message || t('CALENDAR.BLOCK_DATES_SUCCESS'));
      setStartDate(null);
      setEndDate(null);
      setBlockReason('');
      await fetchBlockedEntries(homestayId);
      refetchPropertyDetail();
    } catch (error) {
      if (!error?.response?.data?.message) {
        errorToast(t('CALENDAR.BLOCK_DATES_FAILED'));
      }
    } finally {
      setIsBlockingDates(false);
    }
  }, [
    blockReason,
    endDate,
    fetchBlockedEntries,
    isBlockingDates,
    refetchPropertyDetail,
    selectedProperty?.id,
    startDate,
    t,
  ]);

  const handleDeleteBlockedEntry = useCallback(
    entryId => {
      const entry = blockedEntries.find(item => item.id === entryId);
      if (!entry || deletingEntryId) {
        return;
      }
      setDeleteTarget(entry);
    },
    [blockedEntries, deletingEntryId],
  );

  const handleCloseDeleteModal = useCallback(() => {
    if (deletingEntryId) {
      return;
    }
    setDeleteTarget(null);
  }, [deletingEntryId]);

  const handleConfirmDeleteBlockedEntry = useCallback(async () => {
    const entryId = deleteTarget?.id;
    const homestayId = selectedProperty?.id;

    if (!entryId || deletingEntryId) {
      return;
    }

    try {
      setDeletingEntryId(entryId);
      const response = await makeDeleteBlockedDateRequest(entryId);
      successToast(response?.message || t('CALENDAR.DELETE_BLOCK_SUCCESS'));
      setDeleteTarget(null);
      await fetchBlockedEntries(homestayId);
      refetchPropertyDetail();
    } catch (error) {
      if (!error?.response?.data?.message) {
        errorToast(t('CALENDAR.DELETE_BLOCK_FAILED'));
      }
    } finally {
      setDeletingEntryId(null);
    }
  }, [
    deleteTarget?.id,
    deletingEntryId,
    fetchBlockedEntries,
    refetchPropertyDetail,
    selectedProperty?.id,
    t,
  ]);

  const renderPropertyChip = useCallback(
    item => {
      const isSelected = item.id === selectedProperty?.id;
      const location = formatPropertyLocation(item.city, item.state);

      return (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.85}
          onPress={() => handleSelectProperty(item.id)}
          style={[styles.chip, isSelected && styles.chipSelected]}>
          <Image
            source={{uri: item.primaryImageUrl}}
            style={styles.chipImage}
          />
          <View style={styles.chipTextWrap}>
            <StyledText
              numberOfLines={1}
              size={13}
              variant="semiBold"
              containerStyle={styles.chipTitle}>
              {item.title}
            </StyledText>
            <StyledText
              color={COLORS.TEXT_SECONDARY}
              numberOfLines={1}
              size={11}>
              {location}
            </StyledText>
          </View>
        </TouchableOpacity>
      );
    },
    [handleSelectProperty, selectedProperty?.id],
  );

  const renderTabs = () => (
    <View style={styles.tabsRow}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setActiveTab(TAB.AVAILABILITY)}
        style={[
          styles.tab,
          activeTab === TAB.AVAILABILITY && styles.tabActive,
        ]}>
        <StyledText
          color={
            activeTab === TAB.AVAILABILITY
              ? COLORS.PRIMARY
              : COLORS.TEXT_MUTED
          }
          size={14}
          variant="semiBold">
          {t('CALENDAR.TAB_AVAILABILITY')}
        </StyledText>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setActiveTab(TAB.OFF_SEASON)}
        style={[
          styles.tab,
          activeTab === TAB.OFF_SEASON && styles.tabActive,
        ]}>
        <StyledText
          color={
            activeTab === TAB.OFF_SEASON ? COLORS.PRIMARY : COLORS.TEXT_MUTED
          }
          size={14}
          variant="semiBold">
          {t('CALENDAR.TAB_OFF_SEASON')}
        </StyledText>
      </TouchableOpacity>
    </View>
  );

  const handleOpenAddOffSeason = useCallback(() => {
    setEditingOffSeasonPeriod(null);
    setOffSeasonModalError('');
    setIsAddOffSeasonVisible(true);
  }, []);

  const handleOpenEditOffSeason = useCallback(period => {
    setEditingOffSeasonPeriod(period);
    setOffSeasonModalError('');
    setIsAddOffSeasonVisible(true);
  }, []);

  const handleCloseAddOffSeason = useCallback(() => {
    if (isAddingOffSeason) {
      return;
    }
    setIsAddOffSeasonVisible(false);
    setEditingOffSeasonPeriod(null);
    setOffSeasonModalError('');
  }, [isAddingOffSeason]);

  const handleClearOffSeasonModalError = useCallback(() => {
    setOffSeasonModalError('');
  }, []);

  const handleOpenDeleteOffSeason = useCallback(
    period => {
      if (!period?.id || isDeletingOffSeason) {
        return;
      }
      setDeleteOffSeasonError('');
      setDeleteOffSeasonTarget(period);
    },
    [isDeletingOffSeason],
  );

  const handleCloseDeleteOffSeason = useCallback(() => {
    if (isDeletingOffSeason) {
      return;
    }
    setDeleteOffSeasonTarget(null);
    setDeleteOffSeasonError('');
  }, [isDeletingOffSeason]);

  const handleConfirmDeleteOffSeason = useCallback(async () => {
    const periodId = deleteOffSeasonTarget?.id;
    const homestayId = selectedProperty?.id;

    if (!periodId || !homestayId || isDeletingOffSeason) {
      return;
    }

    try {
      setDeleteOffSeasonError('');
      setIsDeletingOffSeason(true);
      const response = await makeDeleteOffSeasonPeriodRequest(
        homestayId,
        periodId,
      );
      successToast(
        response?.message || t('CALENDAR.OFF_SEASON_DELETE_SUCCESS'),
      );
      setDeleteOffSeasonTarget(null);
      await fetchOffSeasonPeriods(homestayId);
    } catch (error) {
      setDeleteOffSeasonError(
        error?.response?.data?.message ||
          t('CALENDAR.OFF_SEASON_DELETE_FAILED'),
      );
    } finally {
      setIsDeletingOffSeason(false);
    }
  }, [
    deleteOffSeasonTarget?.id,
    fetchOffSeasonPeriods,
    isDeletingOffSeason,
    selectedProperty?.id,
    t,
  ]);

  const handleConfirmAddOffSeason = useCallback(
    async period => {
      const homestayId = selectedProperty?.id;
      if (!homestayId || !period || isAddingOffSeason) {
        return;
      }

      const payload = {
        startMonth: period.startMonth,
        startDay: period.startDay,
        endMonth: period.endMonth,
        endDay: period.endDay,
      };

      try {
        setOffSeasonModalError('');
        setIsAddingOffSeason(true);
        const response = period.id
          ? await makeUpdateOffSeasonPeriodRequest(
              homestayId,
              period.id,
              payload,
            )
          : await makeCreateOffSeasonPeriodRequest(homestayId, payload);

        successToast(
          response?.message ||
            (period.id
              ? t('CALENDAR.OFF_SEASON_UPDATE_SUCCESS')
              : t('CALENDAR.OFF_SEASON_ADD_SUCCESS')),
        );
        setIsAddOffSeasonVisible(false);
        setEditingOffSeasonPeriod(null);
        setOffSeasonModalError('');
        await fetchOffSeasonPeriods(homestayId);
      } catch (error) {
        setOffSeasonModalError(
          error?.response?.data?.message ||
            (period.id
              ? t('CALENDAR.OFF_SEASON_UPDATE_FAILED')
              : t('CALENDAR.OFF_SEASON_ADD_FAILED')),
        );
      } finally {
        setIsAddingOffSeason(false);
      }
    },
    [
      fetchOffSeasonPeriods,
      isAddingOffSeason,
      selectedProperty?.id,
      t,
    ],
  );

  const renderOffSeasonPanel = () => {
    if (canManageOffSeason) {
      return (
        <View style={styles.offSeasonCard}>
          <View style={styles.offSeasonEnabledRow}>
            <View style={styles.offSeasonEnabledCopy}>
              <StyledText
                size={16}
                variant="semiBold"
                containerStyle={styles.offSeasonTitle}>
                {t('CALENDAR.OFF_SEASON_TITLE')}
              </StyledText>
              <StyledText
                color={COLORS.TEXT_SECONDARY}
                size={13}
                containerStyle={styles.offSeasonDescription}>
                {t('CALENDAR.OFF_SEASON_DESCRIPTION')}
              </StyledText>
              {isOffSeasonPeriodsLoading ? (
                <Skeleton
                  isLoading
                  layout={[
                    {
                      key: 'off-season-loading',
                      width: CONTENT_WIDTH * 0.55,
                      height: 14,
                      borderRadius: 6,
                    },
                  ]}
                  boneColor={COLORS.SKELETON_BONE}
                  highlightColor={COLORS.SKELETON_HIGHLIGHT}
                />
              ) : offSeasonPeriods.length ? (
                <StyledText
                  color={COLORS.TEXT_MUTED}
                  size={12}
                  containerStyle={styles.offSeasonEmptyText}>
                  {t('CALENDAR.OFF_SEASON_PERIODS_COUNT', {
                    count: offSeasonPeriods.length,
                    title: selectedProperty?.title || '',
                  })}
                </StyledText>
              ) : (
                <StyledText
                  color={COLORS.TEXT_MUTED}
                  size={12}
                  containerStyle={styles.offSeasonEmptyText}>
                  {t('CALENDAR.OFF_SEASON_EMPTY')}
                </StyledText>
              )}
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={isAddingOffSeason}
              onPress={handleOpenAddOffSeason}
              style={[styles.addPeriodButton, styles.addPeriodButtonEnabled]}>
              <PlusIcon color={COLORS.WHITE} size={16} />
              <StyledText
                color={COLORS.WHITE}
                size={13}
                variant="semiBold"
                containerStyle={styles.addPeriodLabel}>
                {t('CALENDAR.OFF_SEASON_ADD_PERIOD')}
              </StyledText>
            </TouchableOpacity>
          </View>

          {!!offSeasonPeriods.length && (
            <View style={styles.offSeasonPeriodsList}>
              {offSeasonPeriods.map((period, index) => {
                const isLast = index === offSeasonPeriods.length - 1;
                return (
                  <View
                    key={period.id}
                    style={[
                      styles.offSeasonPeriodRow,
                      isLast && styles.offSeasonPeriodRowLast,
                    ]}>
                    <View style={styles.offSeasonPeriodCopy}>
                      <StyledText
                        size={15}
                        variant="semiBold"
                        containerStyle={styles.offSeasonPeriodTitle}>
                        {formatOffSeasonPeriodLabel(period)}
                      </StyledText>
                      <StyledText color={COLORS.TEXT_MUTED} size={12}>
                        {t('CALENDAR.OFF_SEASON_REPEATS')}
                      </StyledText>
                    </View>
                    <View style={styles.offSeasonPeriodActions}>
                      <TouchableOpacity
                        accessibilityRole="button"
                        hitSlop={8}
                        disabled={isAddingOffSeason || isDeletingOffSeason}
                        onPress={() => handleOpenEditOffSeason(period)}
                        style={styles.offSeasonPeriodAction}>
                        <EditIcon color={COLORS.TEXT_MUTED} size={18} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        accessibilityRole="button"
                        hitSlop={8}
                        disabled={isAddingOffSeason || isDeletingOffSeason}
                        onPress={() => handleOpenDeleteOffSeason(period)}
                        style={styles.offSeasonPeriodAction}>
                        <TrashIcon color={COLORS.RED_ERROR} size={18} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      );
    }

    return (
      <View style={styles.offSeasonCard}>
        <StyledText
          size={16}
          variant="semiBold"
          containerStyle={styles.offSeasonTitle}>
          {t('CALENDAR.OFF_SEASON_TITLE')}
        </StyledText>
        <StyledText
          color={COLORS.TEXT_SECONDARY}
          size={13}
          containerStyle={styles.offSeasonDescription}>
          {t('CALENDAR.OFF_SEASON_DESCRIPTION')}
        </StyledText>

        <TouchableOpacity
          activeOpacity={1}
          disabled
          style={styles.addPeriodButton}>
          <PlusIcon color={COLORS.TEXT_MUTED} size={16} />
          <StyledText
            color={COLORS.TEXT_MUTED}
            size={14}
            variant="semiBold"
            containerStyle={styles.addPeriodLabel}>
            {t('CALENDAR.OFF_SEASON_ADD_PERIOD')}
          </StyledText>
        </TouchableOpacity>

        <View style={styles.infoBanner}>
          <View style={styles.infoIconWrap}>
            <InfoIcon color="#2F6FED" size={16} />
          </View>
          <StyledText
            color="#1F4E79"
            size={12}
            containerStyle={styles.infoText}>
            {t('CALENDAR.OFF_SEASON_INFO')}
          </StyledText>
        </View>

        <StyledText color={COLORS.TEXT_MUTED} size={12} textAlign="center">
          {t('CALENDAR.OFF_SEASON_EMPTY')}
        </StyledText>
      </View>
    );
  };

  const renderCalendarContent = () => {
    if (!selectedProperty) {
      return null;
    }

    const location = formatPropertyLocation(
      selectedProperty.city,
      selectedProperty.state,
    );
    const priceLabel = t('CALENDAR.PRICE_PER_NIGHT', {
      price: formatNightlyPrice(selectedProperty.pricePerDay),
    });
    const propertyCountLabel =
      properties.length === 1
        ? t('CALENDAR.PROPERTY_COUNT_ONE', {count: properties.length})
        : t('CALENDAR.PROPERTY_COUNT_OTHER', {count: properties.length});

    const stats = [
      {
        key: 'blocks',
        label: t('CALENDAR.STAT_BLOCKS'),
        value: blockedStats.blocks,
        color: STAT_COLORS.blocks,
      },
      {
        key: 'manual',
        label: t('CALENDAR.STAT_MANUAL'),
        value: blockedStats.manual,
        color: STAT_COLORS.manual,
      },
      {
        key: 'recurring',
        label: t('CALENDAR.STAT_RECURRING'),
        value: offSeasonPeriods.length,
        color: STAT_COLORS.recurring,
      },
      {
        key: 'booked',
        label: t('CALENDAR.STAT_BOOKED'),
        value: blockedStats.booked,
        color: STAT_COLORS.booked,
      },
    ];

    return (
      <KeyboardAwareScrollView
        enableOnAndroid
        enableAutomaticScroll
        enableResetScrollToCoords={false}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom, 16) + 16},
        ]}>
        <View style={styles.selectorCard}>
          <View style={styles.selectorHeader}>
            <StyledText size={15} variant="semiBold">
              {t('CALENDAR.YOUR_PROPERTIES')}
            </StyledText>
            <StyledText color={COLORS.TEXT_SECONDARY} size={13}>
              {propertyCountLabel}
            </StyledText>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipListContent}>
            {properties.map(renderPropertyChip)}
          </ScrollView>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Image
              source={{uri: selectedProperty.primaryImageUrl}}
              style={styles.detailImage}
            />
            <View style={styles.detailInfo}>
              <StyledText
                size={16}
                variant="semiBold"
                containerStyle={styles.detailTitle}>
                {selectedProperty.title}
              </StyledText>
              {!!location && (
                <View style={styles.locationRow}>
                  <LocationPinIcon size={12} />
                  <StyledText
                    color={COLORS.TEXT_SECONDARY}
                    size={12}
                    containerStyle={styles.locationText}>
                    {location}
                  </StyledText>
                </View>
              )}
              <StyledText color={COLORS.LOGIN_PRIMARY} size={14} variant="bold">
                {priceLabel}
              </StyledText>
            </View>
          </View>

          <View style={styles.statsRow}>
            {stats.map(stat => (
              <View key={stat.key} style={styles.statCard}>
                <StyledText
                  color={COLORS.TEXT_SECONDARY}
                  size={11}
                  containerStyle={styles.statLabel}>
                  {stat.label}
                </StyledText>
                <StyledText color={stat.color} size={22} variant="bold">
                  {stat.value}
                </StyledText>
              </View>
            ))}
          </View>
        </View>

        {renderTabs()}

        {activeTab === TAB.AVAILABILITY ? (
          <>
            <AvailabilityCalendar
              visibleMonth={visibleMonth}
              startDate={startDate}
              endDate={endDate}
              highlightStart={selectedBooking?.startDate}
              highlightEnd={selectedBooking?.endDate}
              dayStatuses={blockedDayStatuses}
              bookings={calendarBookings}
              onChangeMonth={setVisibleMonth}
              onSelectDate={handleSelectDate}
              onPressToday={handlePressToday}
              onPressBooking={handlePressBooking}
            />
            {selectedBooking ? (
              <CalendarBookingCard
                booking={selectedBooking}
                isViewing={isPreviewLoading}
                onClose={handleClearSelectedBooking}
                onViewBooking={handleViewBooking}
              />
            ) : (
              <CalendarSelectionCard
                startDate={startDate}
                endDate={endDate}
                reason={blockReason}
                pricePerDay={selectedProperty.pricePerDay}
                isBlocking={isBlockingDates}
                onChangeReason={setBlockReason}
                onClearStart={handleClearSelection}
                onClearSelection={handleClearSelection}
                onBlockDates={handleBlockDates}
              />
            )}
            {showBlockedSkeleton ? (
              <Skeleton
                isLoading
                layout={BLOCKED_ENTRIES_SKELETON_LAYOUT}
                boneColor={COLORS.SKELETON_BONE}
                highlightColor={COLORS.SKELETON_HIGHLIGHT}
                containerStyle={styles.blockedSkeletonContainer}
              />
            ) : (
              <BlockedEntriesCard
                propertyTitle={selectedProperty.title}
                entries={blockedEntries}
                onDeleteEntry={handleDeleteBlockedEntry}
              />
            )}
          </>
        ) : (
          renderOffSeasonPanel()
        )}
      </KeyboardAwareScrollView>
    );
  };

  const renderBody = () => {
    if (showInitialSkeleton) {
      return (
        <Skeleton
          isLoading
          layout={CALENDAR_SKELETON_LAYOUT}
          boneColor={COLORS.SKELETON_BONE}
          highlightColor={COLORS.SKELETON_HIGHLIGHT}
          containerStyle={styles.skeletonContainer}
        />
      );
    }

    if (isError && !properties.length) {
      return (
        <View style={styles.emptyContainer}>
          <StyledText
            color={COLORS.TEXT_SECONDARY}
            size={13}
            textAlign="center"
            containerStyle={styles.emptyErrorText}>
            {t('CALENDAR.LOAD_ERROR')}
          </StyledText>
        </View>
      );
    }

    if (!hasActiveProperty) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon} />
            <StyledText
              variant="bold"
              size={16}
              textAlign="center"
              containerStyle={styles.emptyTitle}>
              {t('CALENDAR.EMPTY_TITLE')}
            </StyledText>
            <StyledText
              color={COLORS.TEXT_SECONDARY}
              size={13}
              textAlign="center"
              containerStyle={styles.emptyDescription}>
              {t('CALENDAR.EMPTY_DESCRIPTION')}
            </StyledText>
          </View>
        </View>
      );
    }

    return renderCalendarContent();
  };

  return (
    <ScreenContainer noPaddingBottom noPaddingTop>
      <ScreenHeader
        title={t('CALENDAR.TITLE')}
        subtitle={t('CALENDAR.SUBTITLE')}
        onBack={handleBack}
      />
      <View style={styles.content}>{renderBody()}</View>
      <DeleteBlockedEntryModal
        isVisible={!!deleteTarget}
        startDate={deleteTarget?.startDate}
        endDate={deleteTarget?.endDate}
        isDeleting={!!deletingEntryId}
        onCancel={handleCloseDeleteModal}
        onConfirm={handleConfirmDeleteBlockedEntry}
      />
      <AddOffSeasonPeriodModal
        isVisible={isAddOffSeasonVisible}
        isSubmitting={isAddingOffSeason}
        errorMessage={offSeasonModalError}
        initialPeriod={editingOffSeasonPeriod}
        onCancel={handleCloseAddOffSeason}
        onConfirm={handleConfirmAddOffSeason}
        onClearError={handleClearOffSeasonModalError}
      />
      <DeleteOffSeasonPeriodModal
        isVisible={!!deleteOffSeasonTarget}
        period={deleteOffSeasonTarget}
        isDeleting={isDeletingOffSeason}
        errorMessage={deleteOffSeasonError}
        onCancel={handleCloseDeleteOffSeason}
        onConfirm={handleConfirmDeleteOffSeason}
      />
      <PreviewBookingModal
        data={previewData}
        fallbackTitle={previewTitle}
        isLoading={isPreviewLoading}
        isVisible={isPreviewVisible}
        onClose={handleClosePreviewModal}
      />
    </ScreenContainer>
  );
};

export default CalendarScreen;
