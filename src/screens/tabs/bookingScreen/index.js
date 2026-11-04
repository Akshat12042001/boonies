import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, FlatList, RefreshControl, TouchableOpacity, View} from 'react-native';
import moment from 'moment';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Skeleton from 'react-native-reanimated-skeleton';
import {
  ActionLoadingOverlay,
  ScreenContainer,
  StyledText,
} from '../../../components/atoms';
import {BookingCalendarModal, DeleteBookingModal, PreviewBookingModal} from '../../../components/modals';
import {
  makeDeleteHostBookingRequest,
  makeGetBookingPreviewRequest,
} from '../../../api/common';
import {
  BookingCard,
  BookingFiltersSection,
} from '../../../components/molecules';
import {BOOKING_MENU_ACTION} from '../../../components/molecules/bookingCard';
import {PlusIcon} from '../../../components/svgs';
import {COLORS, NAVIGATION, SCREEN} from '../../../constants';
import {useGetHostDirectBookingsQuery} from '../../../redux/tabs';
import useDebouncedValue from '../../../utils/useDebouncedValue';
import {errorToast, successToast} from '../../../utils/alerts';
import {
  BOOKING_LIST_FILTER_SCOPE,
  formatBookingPreviewResponse,
  formatHostDirectBookings,
  getHostDirectBookingsQueryParams,
} from '../../../utils/booking';
import {
  getDealSummaryShareTitle,
  shareDealSummary,
} from '../../../utils/shareDealSummary';
import {hasStaffModule, STAFF_MODULE} from '../../../utils/staff';
import styles from './styles';

const PAGE_LIMIT = 10;
const POPOVER_CLOSE_DELAY_MS = 500;

const DATE_FIELD = {
  CHECK_IN_FROM: 'checkInFrom',
  CHECK_OUT_FROM: 'checkOutFrom',
};

const formatDisplayDate = date =>
  date ? moment(date).format('DD/MM/YYYY') : '';

const BOOKING_SKELETON_LAYOUT = Array.from({length: 3}, (_, index) => ({
  key: `booking-skeleton-${index}`,
  width: SCREEN.WIDTH - 32,
  height: 132,
  borderRadius: 16,
  marginBottom: index === 2 ? 0 : 12,
}));

const keyExtractor = item => item.id;

const ItemSeparator = () => <View style={styles.separator} />;

const BookingScreen = () => {
  const {t} = useTranslation();
  const user = useSelector(state => state.auth.user);
  const canAddDirectBooking = hasStaffModule(
    user,
    STAFF_MODULE.DIRECT_BOOKINGS,
  );
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkInFrom, setCheckInFrom] = useState(null);
  const [checkOutFrom, setCheckOutFrom] = useState(null);
  const [filterScope, setFilterScope] = useState(
    BOOKING_LIST_FILTER_SCOPE.ACTIVE_UPCOMING,
  );
  const [activeDateField, setActiveDateField] = useState(null);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingBookingId, setDeletingBookingId] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const [sharingBookingId, setSharingBookingId] = useState(null);
  const [isPopoverLoading, setIsPopoverLoading] = useState(false);

  const debouncedSearch = useDebouncedValue(searchQuery, 400);
  const isActiveUpcoming =
    filterScope === BOOKING_LIST_FILTER_SCOPE.ACTIVE_UPCOMING;

  const filterKey = useMemo(
    () =>
      JSON.stringify({
        search: String(debouncedSearch || '').trim(),
        checkInFrom: checkInFrom
          ? moment(checkInFrom).format('YYYY-MM-DD')
          : null,
        checkOutFrom: checkOutFrom
          ? moment(checkOutFrom).format('YYYY-MM-DD')
          : null,
        isActiveUpcoming,
      }),
    [checkInFrom, checkOutFrom, debouncedSearch, isActiveUpcoming],
  );
  const filterKeyRef = useRef(filterKey);
  const requestPage = filterKeyRef.current === filterKey ? page : 1;

  const queryParams = useMemo(
    () =>
      getHostDirectBookingsQueryParams({
        page: requestPage,
        limit: PAGE_LIMIT,
        search: debouncedSearch,
        checkInFrom,
        checkOutFrom,
        isActiveUpcoming,
      }),
    [
      checkInFrom,
      checkOutFrom,
      debouncedSearch,
      isActiveUpcoming,
      requestPage,
    ],
  );

  const {
    data: bookingsResponse,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useGetHostDirectBookingsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const bookings = useMemo(
    () => formatHostDirectBookings(bookingsResponse),
    [bookingsResponse],
  );

  const hasNextPage =
    (bookingsResponse?.meta?.page || requestPage) <
    (bookingsResponse?.meta?.totalPages || 1);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  useEffect(() => {
    filterKeyRef.current = filterKey;
    setPage(1);
  }, [filterKey]);

  const handleOpenCheckInFrom = useCallback(() => {
    setActiveDateField(DATE_FIELD.CHECK_IN_FROM);
  }, []);

  const handleOpenCheckOutFrom = useCallback(() => {
    setActiveDateField(DATE_FIELD.CHECK_OUT_FROM);
  }, []);

  const handleDateCancel = useCallback(() => {
    setActiveDateField(null);
  }, []);

  const handleDateClear = useCallback(() => {
    if (activeDateField === DATE_FIELD.CHECK_IN_FROM) {
      setCheckInFrom(null);
    } else if (activeDateField === DATE_FIELD.CHECK_OUT_FROM) {
      setCheckOutFrom(null);
    }
    setActiveDateField(null);
  }, [activeDateField]);

  const handleDateConfirm = useCallback(
    date => {
      if (activeDateField === DATE_FIELD.CHECK_IN_FROM) {
        setCheckInFrom(date);
        if (checkOutFrom && checkOutFrom < date) {
          setCheckOutFrom(null);
        }
      } else if (activeDateField === DATE_FIELD.CHECK_OUT_FROM) {
        setCheckOutFrom(date);
      }
      setActiveDateField(null);
    },
    [activeDateField, checkOutFrom],
  );

  const handleCloseDeleteModal = useCallback(() => {
    if (deletingBookingId) {
      return;
    }
    setDeleteTarget(null);
  }, [deletingBookingId]);

  const handleConfirmDeleteBooking = useCallback(async () => {
    const bookingId = deleteTarget?.id;
    if (!bookingId || deletingBookingId) {
      return;
    }

    try {
      setDeletingBookingId(bookingId);
      const response = await makeDeleteHostBookingRequest(bookingId);
      successToast(response?.message || t('BOOKING_LIST.DELETE_SUCCESS'));
      setDeleteTarget(null);

      if (page === 1) {
        refetch();
      } else {
        setPage(1);
      }
    } catch {
      // APIClient displays the server error toast.
    } finally {
      setDeletingBookingId(null);
    }
  }, [deleteTarget?.id, deletingBookingId, page, refetch, t]);

  const handleClosePreviewModal = useCallback(() => {
    setIsPreviewVisible(false);
    setPreviewData(null);
    setPreviewTitle('');
    setIsPreviewLoading(false);
  }, []);

  const handleOpenPreviewBooking = useCallback(
    async (bookingId, fallbackTitle = '') => {
      setPreviewTitle(fallbackTitle);
      setPreviewData(null);
      setIsPreviewVisible(true);
      setIsPreviewLoading(true);

      try {
        const response = await makeGetBookingPreviewRequest(bookingId);
        setPreviewData(formatBookingPreviewResponse(response));
      } catch {
        // APIClient displays the server error toast.
        setIsPreviewVisible(false);
        setPreviewData(null);
        setPreviewTitle('');
      } finally {
        setIsPreviewLoading(false);
      }
    },
    [],
  );

  const handleShareBooking = useCallback(
    async (bookingId, fallbackTitle = '') => {
      if (sharingBookingId) {
        return;
      }

      try {
        setSharingBookingId(bookingId);
        const response = await makeGetBookingPreviewRequest(bookingId);
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
        // APIClient already toasts API failures.
        if (!error?.response) {
          errorToast(t('BOOKING_LIST.SHARE_FAILED'));
        }
      } finally {
        setSharingBookingId(null);
      }
    },
    [sharingBookingId, t],
  );

  const handleBookingMenuAction = useCallback(
    (action, bookingId) => {
      const booking = bookings.find(item => item.id === bookingId);

      if (action === BOOKING_MENU_ACTION.PREVIEW) {
        setIsPopoverLoading(true);
        setTimeout(() => {
          setIsPopoverLoading(false);
          handleOpenPreviewBooking(bookingId, booking?.homestayTitle || '');
        }, POPOVER_CLOSE_DELAY_MS);
        return;
      }

      if (action === BOOKING_MENU_ACTION.SHARE) {
        setIsPopoverLoading(true);
        setTimeout(() => {
          handleShareBooking(bookingId, booking?.homestayTitle || '').finally(
            () => {
              setIsPopoverLoading(false);
            },
          );
        }, POPOVER_CLOSE_DELAY_MS);
        return;
      }

      if (action === BOOKING_MENU_ACTION.EDIT) {
        setTimeout(() => {
          navigation.navigate(NAVIGATION.STACKS.COMMON, {
            screen: NAVIGATION.COMMON.CREATE_BOOKING_SCREEN,
            params: {bookingId},
          });
        }, POPOVER_CLOSE_DELAY_MS);
        return;
      }

      if (action === BOOKING_MENU_ACTION.CREATE_BILL) {
        setTimeout(() => {
          navigation.navigate(NAVIGATION.STACKS.COMMON, {
            screen: NAVIGATION.COMMON.CREATE_INVOICE_SCREEN,
            params: {bookingId},
          });
        }, POPOVER_CLOSE_DELAY_MS);
        return;
      }

      if (action !== BOOKING_MENU_ACTION.DELETE) {
        return;
      }

      setTimeout(() => {
        setDeleteTarget({
          id: bookingId,
          guestName: booking?.guestName || '',
        });
      }, POPOVER_CLOSE_DELAY_MS);
    },
    [bookings, handleOpenPreviewBooking, handleShareBooking, navigation],
  );

  const handleBookingCardPress = useCallback(
    bookingId => {
      const booking = bookings.find(item => item.id === bookingId);
      handleOpenPreviewBooking(bookingId, booking?.homestayTitle || '');
    },
    [bookings, handleOpenPreviewBooking],
  );

  const renderBooking = useCallback(
    ({item}) => (
      <BookingCard
        id={item.id}
        homestayTitle={item.homestayTitle}
        guestName={item.guestName}
        guestPhone={item.guestPhone}
        checkIn={item.checkIn}
        checkOut={item.checkOut}
        offeredPrice={item.offeredPrice}
        adults={item.adults}
        onMenuAction={handleBookingMenuAction}
        onPress={handleBookingCardPress}
      />
    ),
    [handleBookingCardPress, handleBookingMenuAction],
  );

  const handleLoadMore = useCallback(() => {
    if (!isFetching && hasNextPage) {
      setPage(currentPage => currentPage + 1);
    }
  }, [hasNextPage, isFetching]);

  const handleRefresh = useCallback(() => {
    setIsPullRefreshing(true);
    if (page === 1) {
      refetch();
      return;
    }

    setPage(1);
  }, [page, refetch]);

  useEffect(() => {
    if (!isFetching && isPullRefreshing) {
      setIsPullRefreshing(false);
    }
  }, [isFetching, isPullRefreshing]);

  const showListSkeleton =
    (isLoading || (isFetching && requestPage === 1 && !bookings.length)) &&
    !isPullRefreshing;

  const listData = showListSkeleton ? [] : bookings;

  const renderFooter = useCallback(() => {
    if (!isFetching || requestPage === 1) {
      return null;
    }

    return (
      <View style={styles.paginationLoader}>
        <ActivityIndicator color={COLORS.LOGIN_PRIMARY} />
      </View>
    );
  }, [isFetching, requestPage]);

  const renderEmpty = useCallback(() => {
    if (showListSkeleton) {
      return (
        <Skeleton
          isLoading
          layout={BOOKING_SKELETON_LAYOUT}
          boneColor={COLORS.SKELETON_BONE}
          highlightColor={COLORS.SKELETON_HIGHLIGHT}
          containerStyle={styles.skeletonContainer}
        />
      );
    }

    if (isError) {
      return (
        <View style={styles.emptyContainer}>
          <StyledText
            color={COLORS.TEXT_SECONDARY}
            size={13}
            textAlign="center"
            containerStyle={styles.emptyErrorText}>
            {t('BOOKING_LIST.LOAD_ERROR')}
          </StyledText>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon} />
          <StyledText
            variant="bold"
            size={16}
            textAlign="center"
            containerStyle={styles.emptyTitle}>
            {t('BOOKING_LIST.EMPTY_TITLE')}
          </StyledText>
          <StyledText
            color={COLORS.TEXT_SECONDARY}
            size={13}
            textAlign="center"
            containerStyle={styles.emptyDescription}>
            {t('BOOKING_LIST.EMPTY_DESCRIPTION')}
          </StyledText>
        </View>
      </View>
    );
  }, [isError, showListSkeleton, t]);

  const listHeader = useMemo(
    () => (
      <BookingFiltersSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        checkInFromValue={formatDisplayDate(checkInFrom)}
        checkInToValue={formatDisplayDate(checkOutFrom)}
        onOpenCheckInFrom={handleOpenCheckInFrom}
        onOpenCheckInTo={handleOpenCheckOutFrom}
        filterScope={filterScope}
        onFilterScopeChange={setFilterScope}
      />
    ),
    [
      checkInFrom,
      checkOutFrom,
      filterScope,
      handleOpenCheckInFrom,
      handleOpenCheckOutFrom,
      searchQuery,
    ],
  );

  const calendarSelectedDate =
    activeDateField === DATE_FIELD.CHECK_OUT_FROM ? checkOutFrom : checkInFrom;

  const onAddBooking = useCallback(() => {
    navigation.navigate(NAVIGATION.STACKS.COMMON, {
      screen: NAVIGATION.COMMON.CREATE_BOOKING_SCREEN,
    });
  }, [navigation]);

  const headerStyle = useMemo(
    () => [styles.header, {paddingTop: insets.top || 20, paddingBottom: 20}],
    [insets.top],
  );

  const bookingCount =
    Number(bookingsResponse?.meta?.total) || bookings.length || 0;
  const subtitle = t('BOOKING.SUBTITLE', {count: bookingCount});

  return (
    <ScreenContainer noPaddingTop noPaddingBottom>
      <View style={styles.screen}>
        <View style={headerStyle}>
          <View style={styles.topRow}>
            <StyledText color={COLORS.SURFACE} variant="bold" size={20}>
              {t('BOOKING.TITLE')}
            </StyledText>
            {canAddDirectBooking ? (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={onAddBooking}
                style={styles.newButton}>
                <PlusIcon />
                <StyledText color={COLORS.PRIMARY} variant="bold" size={12}>
                  {t('BOOKING.NEW')}
                </StyledText>
              </TouchableOpacity>
            ) : null}
          </View>
          <StyledText
            color={COLORS.HEADER_TEXT_MUTED}
            size={12}
            containerStyle={styles.subtitle}>
            {subtitle}
          </StyledText>
        </View>

        <View style={styles.flex}>
          <FlatList
            data={listData}
            style={styles.list}
            renderItem={renderBooking}
            keyExtractor={keyExtractor}
            ItemSeparatorComponent={ItemSeparator}
            ListHeaderComponent={listHeader}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.4}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={isPullRefreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.LOGIN_PRIMARY}
                colors={[COLORS.LOGIN_PRIMARY]}
              />
            }
          />
        </View>
      </View>

      <DeleteBookingModal
        guestName={deleteTarget?.guestName}
        isDeleting={!!deletingBookingId}
        isVisible={!!deleteTarget}
        onCancel={handleCloseDeleteModal}
        onConfirm={handleConfirmDeleteBooking}
      />

      <PreviewBookingModal
        data={previewData}
        fallbackTitle={previewTitle}
        isLoading={isPreviewLoading}
        isVisible={isPreviewVisible}
        onClose={handleClosePreviewModal}
      />

      <ActionLoadingOverlay
        visible={isPopoverLoading || !!sharingBookingId}
      />

      <BookingCalendarModal
        isVisible={!!activeDateField}
        title={
          activeDateField === DATE_FIELD.CHECK_OUT_FROM
            ? t('BOOKING_LIST.CHECK_IN_TO')
            : t('BOOKING_LIST.CHECK_IN_FROM')
        }
        selectedDate={calendarSelectedDate}
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

export default BookingScreen;
