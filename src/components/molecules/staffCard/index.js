import React, {useCallback, useMemo, useState} from 'react';
import {TouchableOpacity, View} from 'react-native';
import Popover, {PopoverPlacement} from 'react-native-popover-view';
import {useTranslation} from 'react-i18next';
import {StyledText} from '../../atoms';
import {MoreIcon} from '../../svgs';
import {COLORS} from '../../../constants';
import {getInitials} from '../../../utils/invoice';
import {
  STAFF_MENU_ITEMS,
  STAFF_PENDING_MENU_ITEMS,
} from './config';
import styles from './styles';

const MENU_ICON_SIZE = 18;
const PENDING_STATUS_COLOR = '#C9A227';

const getStaffName = item =>
  [item?.firstName, item?.lastName].filter(Boolean).join(' ').trim() ||
  item?.name ||
  'Staff';

const StaffCard = ({item, menuItems, onMenuAction}) => {
  const {t} = useTranslation();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const name = useMemo(() => getStaffName(item), [item]);
  const isInvitePending = Boolean(item?.invitePending);
  const isActive = String(item?.status || '').toLowerCase() === 'active';
  const phone = String(item?.phone || '').trim();

  const resolvedMenuItems = useMemo(() => {
    if (menuItems) {
      return menuItems;
    }
    return isInvitePending ? STAFF_PENDING_MENU_ITEMS : STAFF_MENU_ITEMS;
  }, [isInvitePending, menuItems]);

  const handleOpenMenu = useCallback(() => {
    setIsMenuVisible(true);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setIsMenuVisible(false);
  }, []);

  const handleMenuItemPress = useCallback(
    action => {
      setIsMenuVisible(false);
      onMenuAction?.(action, item);
    },
    [item, onMenuAction],
  );

  const statusLabel = isInvitePending
    ? t('STAFF.STATUS_INVITE_PENDING')
    : t(isActive ? 'STAFF.STATUS_ACTIVE' : 'STAFF.STATUS_INACTIVE');
  const statusColor = isInvitePending
    ? PENDING_STATUS_COLOR
    : isActive
    ? COLORS.LOGIN_PRIMARY
    : COLORS.TEXT_MUTED;
  const statusBadgeStyle = isInvitePending
    ? styles.statusPending
    : isActive
    ? styles.statusActive
    : styles.statusInactive;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <StyledText
            size={14}
            variant="semiBold"
            color={COLORS.INVOICE_AVATAR_TEXT}>
            {getInitials(name)}
          </StyledText>
        </View>

        <View style={styles.cardMain}>
          <View style={styles.nameRow}>
            <StyledText
              variant="bold"
              size={15}
              numberOfLines={1}
              containerStyle={styles.name}>
              {name}
            </StyledText>
            {!isInvitePending ? (
              <View style={[styles.statusBadge, statusBadgeStyle]}>
                <StyledText size={11} variant="semiBold" color={statusColor}>
                  {statusLabel}
                </StyledText>
              </View>
            ) : null}
          </View>

          {item?.email ? (
            <StyledText
              color={COLORS.TEXT_SECONDARY}
              size={13}
              numberOfLines={1}
              containerStyle={styles.detailRow}>
              {item.email}
            </StyledText>
          ) : null}

          <StyledText
            color={COLORS.TEXT_MUTED}
            size={13}
            numberOfLines={1}
            containerStyle={styles.detailRow}>
            {phone || t('STAFF.PHONE_EMPTY')}
          </StyledText>
        </View>

        <Popover
          isVisible={isMenuVisible}
          arrowSize={{width: 0, height: 0}}
          backgroundStyle={styles.popoverBackdrop}
          displayAreaInsets={{top: 16, bottom: 16, left: 16, right: 16}}
          onRequestClose={handleCloseMenu}
          placement={PopoverPlacement.BOTTOM}
          popoverStyle={styles.popover}
          from={
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t('STAFF.MORE_OPTIONS')}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              onPress={handleOpenMenu}
              style={styles.menuButton}>
              <MoreIcon color={COLORS.GREYSCALE_900} width={18} height={18} />
            </TouchableOpacity>
          }>
          <View style={styles.menuList}>
            {resolvedMenuItems.map(menuItem => {
              const iconColor = menuItem.destructive
                ? COLORS.INVOICE_DELETE
                : COLORS.GREYSCALE_900;
              const textColor = menuItem.destructive
                ? COLORS.INVOICE_DELETE
                : COLORS.TEXT;

              return (
                <TouchableOpacity
                  key={menuItem.action}
                  accessibilityRole="button"
                  onPress={() => handleMenuItemPress(menuItem.action)}
                  style={styles.menuItem}>
                  <View style={styles.menuItemIcon}>
                    <menuItem.Icon color={iconColor} size={MENU_ICON_SIZE} />
                  </View>
                  <StyledText color={textColor} size={14} variant="medium">
                    {t(menuItem.labelKey)}
                  </StyledText>
                </TouchableOpacity>
              );
            })}
          </View>
        </Popover>
      </View>

      {isInvitePending ? (
        <View style={styles.actionsFooter}>
          <View style={[styles.statusBadge, statusBadgeStyle]}>
            <StyledText size={11} variant="semiBold" color={statusColor}>
              {statusLabel}
            </StyledText>
          </View>
        </View>
      ) : null}
    </View>
  );
};

export {STAFF_MENU_ACTION} from './config';
export default React.memo(StaffCard);
