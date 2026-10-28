import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  TextInput,
  View,
} from 'react-native';
import Skeleton from 'react-native-reanimated-skeleton';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {ScreenContainer, StyledText} from '../../../components/atoms';
import {SearchIcon} from '../../../components/svgs';
import {COLORS, NAVIGATION, SCREEN} from '../../../constants';
import {
  useGetConversationsQuery,
  useGetUnreadCountQuery,
} from '../../../redux/tabs';
import {SocketService} from '../../../services';
import {SOCKET_EVENTS} from '../../../services/socketService';
import {getInitials} from '../../../utils/invoice';
import {mapConversation} from '../../../utils/messages';
import useDebouncedValue from '../../../utils/useDebouncedValue';
import styles from './styles';

const PAGE_LIMIT = 20;

const CONVERSATION_SKELETON_LAYOUT = Array.from({length: 6}, (_, index) => ({
  key: `conversation-skeleton-${index}`,
  width: SCREEN.WIDTH - 32,
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 22,
  children: [
    {
      key: `conversation-avatar-${index}`,
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 12,
    },
    {
      key: `conversation-copy-${index}`,
      flex: 1,
      children: [
        {
          key: `conversation-name-${index}`,
          width: '46%',
          height: 14,
          borderRadius: 7,
          marginBottom: 8,
        },
        {
          key: `conversation-homestay-${index}`,
          width: '74%',
          height: 12,
          borderRadius: 6,
          marginBottom: 6,
        },
        {
          key: `conversation-preview-${index}`,
          width: '38%',
          height: 12,
          borderRadius: 6,
        },
      ],
    },
  ],
}));

const keyExtractor = item => item.id;

const ItemSeparator = memo(({leadingItem}) => (
  <View
    style={[
      styles.separator,
      leadingItem?.hasUnread && styles.separatorUnread,
    ]}
  />
));

const ConversationRow = memo(({item, emptyPreview, onPress}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = !!item.avatarUrl && !imageFailed;
  const isUnread = !!item.hasUnread;
  const handleImageError = useCallback(() => {
    setImageFailed(true);
  }, []);

  return (
    <Pressable
      style={[styles.row, isUnread && styles.rowUnread]}
      onPress={onPress}>
      <View style={styles.avatar}>
        {showImage ? (
          <Image
            source={{uri: item.avatarUrl}}
            style={styles.avatarImage}
            onError={handleImageError}
          />
        ) : (
          <StyledText
            size={14}
            variant="semiBold"
            color={COLORS.INVOICE_AVATAR_TEXT}>
            {getInitials(item.name)}
          </StyledText>
        )}
      </View>
      <View style={styles.body}>
        <View style={styles.topRow}>
          <StyledText
            size={15}
            variant="bold"
            color={COLORS.TEXT}
            numberOfLines={1}
            containerStyle={styles.name}>
            {item.name}
          </StyledText>
          {item.timeLabel ? (
            <StyledText
              size={12}
              variant="semiBold"
              color={isUnread ? COLORS.LOGIN_PRIMARY : COLORS.TEXT_MUTED}
              numberOfLines={1}
              containerStyle={styles.time}>
              {item.timeLabel}
            </StyledText>
          ) : null}
        </View>
        {item.homestayTitle ? (
          <StyledText
            size={13}
            color={COLORS.TEXT_SECONDARY}
            numberOfLines={1}
            containerStyle={styles.homestay}>
            {item.homestayTitle}
          </StyledText>
        ) : null}
        <View style={styles.bottomRow}>
          <StyledText
            size={14}
            variant={isUnread ? 'semiBold' : 'regular'}
            color={isUnread ? COLORS.TEXT : COLORS.TEXT_MUTED}
            numberOfLines={1}
            containerStyle={styles.preview}>
            {item.preview || emptyPreview}
          </StyledText>
          {isUnread ? (
            <View style={styles.unreadCountBadge}>
              <StyledText color={COLORS.WHITE} variant="bold" size={11}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </StyledText>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
});

const MessagesScreen = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const user = useSelector(state => state.auth.user);
  const [page, setPage] = useState(1);
  const pageRef = useRef(page);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const searchRef = useRef(searchQuery);
  pageRef.current = page;
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const trimmedSearch = debouncedSearch.trim();
  const requestPage = searchRef.current === trimmedSearch ? page : 1;
  const queryArgs = useMemo(() => {
    const params = {page: requestPage, limit: PAGE_LIMIT};
    if (trimmedSearch) {
      params.search = trimmedSearch;
    }
    return params;
  }, [requestPage, trimmedSearch]);
  const {data, isLoading, isFetching, isError, refetch} =
    useGetConversationsQuery(queryArgs);
  const {data: unreadData, refetch: refetchUnread} = useGetUnreadCountQuery();
  const unreadCount = Number(unreadData?.unreadCount || 0);

  const headerStyle = useMemo(
    () => [styles.header, {paddingTop: insets.top || 20}],
    [insets.top],
  );

  const conversations = useMemo(
    () => (data?.conversations || []).map(item => mapConversation(item, user)),
    [data?.conversations, user],
  );

  const hasNextPage =
    (data?.meta?.page || requestPage) < (data?.meta?.totalPages || 1);
  const isSearching = trimmedSearch.length > 0;
  const showListSkeleton = isLoading && !data;

  useEffect(() => {
    searchRef.current = trimmedSearch;
    setPage(1);
  }, [trimmedSearch]);

  useEffect(() => {
    if (!isFetching && isPullRefreshing) {
      setIsPullRefreshing(false);
    }
  }, [isFetching, isPullRefreshing]);

  useFocusEffect(
    useCallback(() => {
      if (!SocketService.isConnected()) {
        SocketService.create();
      }

      setPage(1);
      refetch();
      refetchUnread();

      return SocketService.subscribe(event => {
        if (
          event === SOCKET_EVENTS.NEW_MESSAGE_NOTIFICATION ||
          event === SOCKET_EVENTS.MESSAGE_RECEIVED ||
          event === SOCKET_EVENTS.MESSAGES_READ
        ) {
          setPage(1);
          refetch();
          refetchUnread();
        }
      });
    }, [refetch, refetchUnread]),
  );

  const handleLoadMore = useCallback(() => {
    if (!isFetching && hasNextPage && !showListSkeleton) {
      setPage(currentPage => currentPage + 1);
    }
  }, [hasNextPage, isFetching, showListSkeleton]);

  const handleRefresh = useCallback(() => {
    setIsPullRefreshing(true);
    if (page === 1) {
      refetch();
      refetchUnread();
      return;
    }

    setPage(1);
  }, [page, refetch, refetchUnread]);

  const renderItem = useCallback(
    ({item}) => (
      <ConversationRow
        item={item}
        emptyPreview={t('CONVERSATIONS.NO_MESSAGES')}
        onPress={() =>
          navigation.navigate(NAVIGATION.STACKS.COMMON, {
            screen: NAVIGATION.COMMON.CHAT_SCREEN,
            params: {
              conversationId: item.id,
              participantId: item.participantId,
              name: item.name,
              homestayTitle: item.homestayTitle,
              avatarUrl: item.avatarUrl,
            },
          })
        }
      />
    ),
    [navigation, t],
  );

  const renderFooter = useCallback(() => {
    if (!isFetching || page === 1) {
      return null;
    }

    return (
      <View style={styles.footer}>
        <ActivityIndicator color={COLORS.LOGIN_PRIMARY} />
      </View>
    );
  }, [isFetching, page]);

  const renderEmpty = useCallback(() => {
    if (showListSkeleton) {
      return (
        <Skeleton
          isLoading
          layout={CONVERSATION_SKELETON_LAYOUT}
          boneColor={COLORS.SKELETON_BONE}
          highlightColor={COLORS.SKELETON_HIGHLIGHT}
          containerStyle={styles.skeleton}
        />
      );
    }

    return (
      <View style={styles.empty}>
        <StyledText color={COLORS.TEXT_SECONDARY} size={14} textAlign="center">
          {t(
            isError
              ? 'CONVERSATIONS.LOAD_ERROR'
              : isSearching
              ? 'CONVERSATIONS.NO_RESULTS'
              : 'CONVERSATIONS.EMPTY',
          )}
        </StyledText>
      </View>
    );
  }, [isError, isSearching, showListSkeleton, t]);

  return (
    <ScreenContainer noPaddingBottom noPaddingTop>
      <View style={styles.screen}>
        <View style={headerStyle}>
          <View style={styles.headerTitle}>
            <StyledText color={COLORS.SURFACE} variant="bold" size={20}>
              {t('TABS.MESSAGES')}
            </StyledText>
            {unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <StyledText color={COLORS.WHITE} variant="bold" size={12}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </StyledText>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.searchWrap}>
          <View style={styles.searchField}>
            <View style={styles.searchIcon}>
              <SearchIcon />
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('CONVERSATIONS.SEARCH_PLACEHOLDER')}
              placeholderTextColor={COLORS.TEXT_MUTED}
              style={styles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
          </View>
        </View>
        <FlatList
          data={showListSkeleton ? [] : conversations}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={ItemSeparator}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={isPullRefreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.LOGIN_PRIMARY}
              colors={[COLORS.LOGIN_PRIMARY]}
            />
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
        />
      </View>
    </ScreenContainer>
  );
};

export default MessagesScreen;
