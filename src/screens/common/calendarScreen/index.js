import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ScreenContainer, StyledText} from '../../../components/atoms';
import {
  AvailabilityCalendar,
  BlockedEntriesCard,
  CalendarSelectionCard,
  ScreenHeader,
} from '../../../components/molecules';
import {
  InfoIcon,
  LocationPinIcon,
  PlusIcon,
} from '../../../components/svgs';
import {COLORS} from '../../../constants';
import {useGetMyPropertiesQuery} from '../../../redux/tabs';
import {getTodayCalendarString} from '../../../utils/calendar';
import {
  formatPropertyLocation,
  getProperties,
} from '../../../utils/property';
import styles from './styles';

const TAB = {
  AVAILABILITY: 'availability',
  OFF_SEASON: 'offSeason',
};

// Static calendar UI data — replace with API-driven properties later.
const STATIC_PROPERTIES = [
  {
    id: '51669824-030a-43cb-a98e-0964f9096f41',
    title: 'Serene Mountain View Homestay',
    city: 'Bir',
    state: 'Himachal Pradesh',
    status: 'active',
    pricePerDay: '1999.97',
    primaryImageUrl:
      'https://boonies-homestay-storage-2.s3.us-east-1.amazonaws.com/homestays/dd82f861-f2ee-4808-9e92-b73506cec823.webp',
    stats: {
      blocks: 5,
      manual: 5,
      recurring: 0,
      booked: 37,
    },
  },
];

const STATIC_BLOCKED_ENTRIES = [
  {
    id: 'block-1',
    type: 'manual',
    startDate: '2027-03-09',
    endDate: '2027-03-12',
  },
  {
    id: 'block-2',
    type: 'manual',
    startDate: '2027-02-15',
    endDate: '2027-02-18',
  },
  {
    id: 'block-3',
    type: 'manual',
    startDate: '2027-04-06',
    endDate: '2027-04-21',
  },
  {
    id: 'block-4',
    type: 'manual',
    startDate: '2027-01-26',
    endDate: '2027-01-29',
  },
  {
    id: 'block-5',
    type: 'manual',
    startDate: '2027-01-05',
    endDate: '2027-01-13',
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

  const apiProperties = useMemo(
    () => getProperties(propertiesResponse),
    [propertiesResponse],
  );

  const properties = STATIC_PROPERTIES;
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    properties[0]?.id,
  );
  const [activeTab, setActiveTab] = useState(TAB.AVAILABILITY);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    moment().startOf('month').toDate(),
  );
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [blockReason, setBlockReason] = useState('');

  const hasActiveProperty = useMemo(
    () => properties.some(isActiveProperty),
    [properties],
  );

  const selectedProperty = useMemo(
    () =>
      properties.find(item => item.id === selectedPropertyId) || properties[0],
    [properties, selectedPropertyId],
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSelectProperty = useCallback(id => {
    setSelectedPropertyId(id);
    setStartDate(null);
    setEndDate(null);
    setBlockReason('');
  }, []);

  const handleClearSelection = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
    setBlockReason('');
  }, []);

  const handleSelectDate = useCallback(
    dateString => {
      if (!startDate || (startDate && endDate)) {
        setStartDate(dateString);
        setEndDate(null);
        setBlockReason('');
        return;
      }

      if (dateString < startDate) {
        setStartDate(dateString);
        setEndDate(null);
        return;
      }

      if (dateString === startDate) {
        return;
      }

      setEndDate(dateString);
    },
    [endDate, startDate],
  );

  const handlePressToday = useCallback(() => {
    const todayString = getTodayCalendarString();
    setVisibleMonth(moment(todayString).startOf('month').toDate());
  }, []);

  const handleBlockDates = useCallback(() => {
    // Static UI for now — wire block API later.
  }, []);

  const handleDeleteBlockedEntry = useCallback(_entryId => {
    // Static UI for now — wire delete API later.
  }, []);

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

  const renderOffSeasonPanel = () => (
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
        value: selectedProperty.stats?.blocks ?? 0,
        color: STAT_COLORS.blocks,
      },
      {
        key: 'manual',
        label: t('CALENDAR.STAT_MANUAL'),
        value: selectedProperty.stats?.manual ?? 0,
        color: STAT_COLORS.manual,
      },
      {
        key: 'recurring',
        label: t('CALENDAR.STAT_RECURRING'),
        value: selectedProperty.stats?.recurring ?? 0,
        color: STAT_COLORS.recurring,
      },
      {
        key: 'booked',
        label: t('CALENDAR.STAT_BOOKED'),
        value: selectedProperty.stats?.booked ?? 0,
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
              defaultPrice={selectedProperty.pricePerDay}
              onChangeMonth={setVisibleMonth}
              onSelectDate={handleSelectDate}
              onPressToday={handlePressToday}
            />
            <CalendarSelectionCard
              startDate={startDate}
              endDate={endDate}
              reason={blockReason}
              pricePerDay={selectedProperty.pricePerDay}
              onChangeReason={setBlockReason}
              onClearStart={handleClearSelection}
              onClearSelection={handleClearSelection}
              onBlockDates={handleBlockDates}
            />
            <BlockedEntriesCard
              propertyTitle={selectedProperty.title}
              entries={STATIC_BLOCKED_ENTRIES}
              onDeleteEntry={handleDeleteBlockedEntry}
            />
          </>
        ) : (
          renderOffSeasonPanel()
        )}
      </KeyboardAwareScrollView>
    );
  };

  const renderBody = () => {
    if (hasActiveProperty) {
      return renderCalendarContent();
    }

    if (isLoading || (isFetching && !propertiesResponse)) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.PRIMARY} size="large" />
        </View>
      );
    }

    if (isError && !apiProperties.length) {
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
  };

  return (
    <ScreenContainer noPaddingBottom noPaddingTop>
      <ScreenHeader
        title={t('CALENDAR.TITLE')}
        subtitle={t('CALENDAR.SUBTITLE')}
        onBack={handleBack}
      />
      <View style={styles.content}>{renderBody()}</View>
    </ScreenContainer>
  );
};

export default CalendarScreen;
