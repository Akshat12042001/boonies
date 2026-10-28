import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  TextInput,
  View,
} from 'react-native';
import Skeleton from 'react-native-reanimated-skeleton';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {
  makeCreateStaffMemberRequest,
  makeDeleteStaffMemberRequest,
  makeGetStaffMembersRequest,
  makeResendStaffInvitationRequest,
  makeUpdateStaffMemberRequest,
} from '../../../api/staff';
import {ScreenContainer, StyledText} from '../../../components/atoms';
import {
  DeleteStaffModal,
  InviteStaffModal,
  ResendStaffInvitationModal,
} from '../../../components/modals';
import {
  ScreenHeader,
  StaffCard,
  STAFF_MENU_ACTION,
} from '../../../components/molecules';
import {PlusIcon, SearchIcon, StaffIcon} from '../../../components/svgs';
import {COLORS, SCREEN} from '../../../constants';
import {successToast} from '../../../utils/alerts';
import {
  buildCreateStaffMemberPayload,
  buildUpdateStaffMemberPayload,
} from '../../../utils/staff';
import useDebouncedValue from '../../../utils/useDebouncedValue';
import styles from './styles';

const PAGE_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 300;
const POPOVER_CLOSE_DELAY_MS = 500;

const staffDisplayName = item =>
  [item?.firstName, item?.lastName].filter(Boolean).join(' ').trim() ||
  item?.name ||
  '';

const STAFF_SKELETON_LAYOUT = Array.from({length: 4}, (_, index) => ({
  key: `staff-skeleton-${index}`,
  width: SCREEN.WIDTH - 32,
  height: 92,
  borderRadius: 16,
  marginBottom: index === 3 ? 0 : 12,
}));

const keyExtractor = item => item.id;

const ItemSeparator = () => <View style={styles.separator} />;

const StaffManagementScreen = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [staffMembers, setStaffMembers] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resendTarget, setResendTarget] = useState(null);
  const [isResending, setIsResending] = useState(false);
  const [isStaffFormVisible, setIsStaffFormVisible] = useState(false);
  const [editingStaffMember, setEditingStaffMember] = useState(null);
  const [isSavingStaff, setIsSavingStaff] = useState(false);
  const requestIdRef = useRef(0);
  const pageRef = useRef(page);
  const searchRef = useRef('');
  const skipFocusFetchRef = useRef(true);
  pageRef.current = page;

  const debouncedSearch = useDebouncedValue(searchQuery, SEARCH_DEBOUNCE_MS);
  const trimmedSearch = debouncedSearch.trim();
  const requestPage = searchRef.current === trimmedSearch ? page : 1;
  const isSearching = trimmedSearch.length > 0;
  const hasNextPage = requestPage < totalPages;
  const showListSkeleton = isLoading && !staffMembers.length;

  const countLabel = useMemo(() => {
    const count = Number(total) || 0;
    return t(count === 1 ? 'STAFF.COUNT_ONE' : 'STAFF.COUNT_OTHER', {count});
  }, [t, total]);

  const fetchStaffMembers = useCallback(
    async ({
      page: nextPage = 1,
      search = '',
      replace = nextPage === 1,
    } = {}) => {
      const requestId = ++requestIdRef.current;
      setIsFetching(true);
      setIsError(false);
      if (replace) {
        setIsLoading(true);
      }

      try {
        const params = {page: nextPage, limit: PAGE_LIMIT};
        if (search) {
          params.search = search;
        }

        const response = await makeGetStaffMembersRequest(params);
        if (requestId !== requestIdRef.current) {
          return;
        }

        const nextItems = Array.isArray(response?.data) ? response.data : [];
        setStaffMembers(current => {
          if (replace) {
            return nextItems;
          }

          const existingIds = new Set(current.map(item => item.id));
          return [
            ...current,
            ...nextItems.filter(item => !existingIds.has(item.id)),
          ];
        });
        setTotal(Number(response?.total) || 0);
        setTotalPages(Number(response?.totalPages) || 1);
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setIsError(true);
        if (replace) {
          setStaffMembers([]);
          setTotal(0);
          setTotalPages(1);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsFetching(false);
          setIsPullRefreshing(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    searchRef.current = trimmedSearch;
    setPage(1);
  }, [trimmedSearch]);

  useEffect(() => {
    fetchStaffMembers({
      page: requestPage,
      search: trimmedSearch,
      replace: requestPage === 1,
    });
  }, [fetchStaffMembers, requestPage, trimmedSearch]);

  useFocusEffect(
    useCallback(() => {
      // Initial open is already handled by the page/search effect.
      if (skipFocusFetchRef.current) {
        skipFocusFetchRef.current = false;
        return;
      }

      setPage(1);
      fetchStaffMembers({
        page: 1,
        search: searchRef.current,
        replace: true,
      });
    }, [fetchStaffMembers]),
  );

  const refreshStaffList = useCallback(() => {
    if (page === 1) {
      fetchStaffMembers({
        page: 1,
        search: searchRef.current,
        replace: true,
      });
      return;
    }
    setPage(1);
  }, [fetchStaffMembers, page]);

  const onAddStaff = useCallback(() => {
    setEditingStaffMember(null);
    setIsStaffFormVisible(true);
  }, []);

  const handleCloseStaffFormModal = useCallback(() => {
    if (isSavingStaff) {
      return;
    }
    setIsStaffFormVisible(false);
    setEditingStaffMember(null);
  }, [isSavingStaff]);

  const handleStaffFormSubmit = useCallback(
    async (values, {isEditMode, staffMember} = {}) => {
      if (isSavingStaff) {
        return;
      }

      try {
        setIsSavingStaff(true);

        if (isEditMode) {
          const memberId = staffMember?.id;
          if (!memberId) {
            return;
          }

          const payload = buildUpdateStaffMemberPayload(values);
          const response = await makeUpdateStaffMemberRequest(
            memberId,
            payload,
          );
          setTimeout(() => {
            successToast(response?.message || t('STAFF.EDIT.SUCCESS'));
          }, 500);
        } else {
          const payload = buildCreateStaffMemberPayload(values);
          const response = await makeCreateStaffMemberRequest(payload);
          setTimeout(() => {
            successToast(response?.message || t('STAFF.INVITE.SUCCESS'));
          }, 500);
        }

        setIsStaffFormVisible(false);
        setEditingStaffMember(null);
        refreshStaffList();
      } catch {
        // APIClient displays the server error toast.
      } finally {
        setIsSavingStaff(false);
      }
    },
    [isSavingStaff, refreshStaffList, t],
  );

  const handleCloseDeleteModal = useCallback(() => {
    if (isDeleting) {
      return;
    }
    setDeleteTarget(null);
  }, [isDeleting]);

  const handleConfirmDelete = useCallback(async () => {
    const memberId = deleteTarget?.id;
    if (!memberId || isDeleting) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await makeDeleteStaffMemberRequest(memberId);
      setTimeout(() => {
        successToast(response?.message || t('STAFF.DELETE_SUCCESS'));
      }, 500);
      setDeleteTarget(null);
      refreshStaffList();
    } catch {
      // APIClient displays the server error toast.
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget?.id, isDeleting, refreshStaffList, t]);

  const handleCloseResendModal = useCallback(() => {
    if (isResending) {
      return;
    }
    setResendTarget(null);
  }, [isResending]);

  const handleConfirmResend = useCallback(async () => {
    const memberId = resendTarget?.id;
    if (!memberId || isResending) {
      return;
    }

    try {
      setIsResending(true);
      const response = await makeResendStaffInvitationRequest(memberId);
      setTimeout(() => {
        successToast(response?.message || t('STAFF.RESEND_SUCCESS'));
      }, 500);
      
      setResendTarget(null);
      refreshStaffList();
    } catch {
      // APIClient displays the server error toast.
    } finally {
      setIsResending(false);
    }
  }, [isResending, refreshStaffList, resendTarget?.id, t]);

  const handleMenuAction = useCallback(
    (action, item) => {
      if (action === STAFF_MENU_ACTION.RESEND) {
        setTimeout(() => {
          setResendTarget(item);
        }, POPOVER_CLOSE_DELAY_MS);
        return;
      }

      if (action === STAFF_MENU_ACTION.EDIT) {
        setTimeout(() => {
          setEditingStaffMember(item);
          setIsStaffFormVisible(true);
        }, POPOVER_CLOSE_DELAY_MS);
        return;
      }

      if (action !== STAFF_MENU_ACTION.DELETE) {
        return;
      }

      setTimeout(() => {
        setDeleteTarget(item);
      }, POPOVER_CLOSE_DELAY_MS);
    },
    [],
  );

  const handleLoadMore = useCallback(() => {
    if (!isFetching && hasNextPage && !showListSkeleton) {
      setPage(currentPage => currentPage + 1);
    }
  }, [hasNextPage, isFetching, showListSkeleton]);

  const handleRefresh = useCallback(() => {
    setIsPullRefreshing(true);
    if (pageRef.current === 1) {
      fetchStaffMembers({
        page: 1,
        search: searchRef.current,
        replace: true,
      });
      return;
    }

    setPage(1);
  }, [fetchStaffMembers]);

  const renderItem = useCallback(
    ({item}) => <StaffCard item={item} onMenuAction={handleMenuAction} />,
    [handleMenuAction],
  );

  const renderFooter = useCallback(() => {
    if (!isFetching || requestPage === 1) {
      return null;
    }

    return (
      <View style={styles.footer}>
        <ActivityIndicator color={COLORS.LOGIN_PRIMARY} />
      </View>
    );
  }, [isFetching, requestPage]);

  const renderEmpty = useCallback(() => {
    if (showListSkeleton) {
      return (
        <Skeleton
          isLoading
          layout={STAFF_SKELETON_LAYOUT}
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
              ? 'STAFF.LOAD_ERROR'
              : isSearching
              ? 'STAFF.NO_RESULTS'
              : 'STAFF.EMPTY',
          )}
        </StyledText>
      </View>
    );
  }, [isError, isSearching, showListSkeleton, t]);

  return (
    <ScreenContainer noPaddingTop noPaddingBottom>
      <ScreenHeader
        title={t('STAFF.TITLE')}
        subtitle={t('STAFF.SUBTITLE')}
        onBack={() => navigation.goBack()}
        rightComponent={
          <Pressable
            accessibilityRole="button"
            onPress={onAddStaff}
            style={styles.headerIconButton}>
            <PlusIcon color={COLORS.WHITE} size={18} />
          </Pressable>
        }
      />

      <View style={styles.body}>
        <View style={styles.content}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <StaffIcon color={COLORS.LOGIN_PRIMARY} width={22} height={22} />
            </View>
            <View style={styles.summaryCopy}>
              <StyledText variant="bold" size={16}>
                {t('STAFF.SECTION_TITLE')}
              </StyledText>
              <StyledText color={COLORS.TEXT_SECONDARY} size={13}>
                {countLabel}
              </StyledText>
            </View>
          </View>

          <View style={styles.searchField}>
            <View style={styles.searchIcon}>
              <SearchIcon />
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('STAFF.SEARCH_PLACEHOLDER')}
              placeholderTextColor={COLORS.TEXT_MUTED}
              style={styles.searchInput}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
          </View>

          <FlatList
            data={showListSkeleton ? [] : staffMembers}
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
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </View>

      <InviteStaffModal
        isVisible={isStaffFormVisible}
        isSubmitting={isSavingStaff}
        staffMember={editingStaffMember}
        onCancel={handleCloseStaffFormModal}
        onSubmit={handleStaffFormSubmit}
      />

      <ResendStaffInvitationModal
        isVisible={Boolean(resendTarget)}
        email={resendTarget?.email}
        isSubmitting={isResending}
        onCancel={handleCloseResendModal}
        onConfirm={handleConfirmResend}
      />

      <DeleteStaffModal
        isVisible={Boolean(deleteTarget)}
        staffName={staffDisplayName(deleteTarget)}
        isDeleting={isDeleting}
        onCancel={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </ScreenContainer>
  );
};

export default StaffManagementScreen;
