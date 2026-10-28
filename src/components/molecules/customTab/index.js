import React, {useCallback, useEffect, useMemo} from 'react';
import {TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import styles from './styles';
import {StyledText} from '../../atoms';
import {COLORS, NAVIGATION} from '../../../constants';
import {
  HomeIcon,
  InvoicesIcon,
  PropertyIcon,
  MoreIcon,
  MenuIcon,
  MessagesIcon,
} from '../../svgs';
import {useGetUnreadCountQuery} from '../../../redux/tabs';
import {SocketService} from '../../../services';
import {SOCKET_EVENTS} from '../../../services/socketService';
import {getVisibleBottomTabs} from '../../../utils/bottomTabs';
import {isStaffUser} from '../../../utils/staff';

const TAB_META_BY_NAME = {
  [NAVIGATION.TABS.HOME_SCREEN]: {title: 'TABS.HOME'},
  [NAVIGATION.TABS.MENU_SCREEN]: {title: 'TABS.MENU'},
  [NAVIGATION.TABS.INVOICES_SCREEN]: {title: 'TABS.INVOICES'},
  [NAVIGATION.TABS.MESSAGES_SCREEN]: {title: 'TABS.MESSAGES'},
  [NAVIGATION.TABS.MORE_SCREEN]: {title: 'TABS.MORE'},
  [NAVIGATION.TABS.PROPERTIES_SCREEN]: {title: 'TABS.PROPERTIES'},
};

const CustomTabBar = ({state, navigation}) => {
  const insets = useSafeAreaInsets();
  const {t} = useTranslation();
  const user = useSelector(state => state.auth.user);
  const skipUnread = isStaffUser(user);
  const {data: unreadData, refetch: refetchUnread} = useGetUnreadCountQuery(
    undefined,
    {skip: skipUnread},
  );
  const unreadCount = Number(unreadData?.unreadCount || 0);

  const visibleTabNames = useMemo(
    () => new Set(getVisibleBottomTabs(user).map(tab => tab.name)),
    [user],
  );

  const visibleRoutes = useMemo(
    () => state.routes.filter(route => visibleTabNames.has(route.name)),
    [state.routes, visibleTabNames],
  );

  useEffect(() => {
    if (skipUnread) {
      return undefined;
    }

    if (!SocketService.isConnected()) {
      SocketService.create();
    }

    return SocketService.subscribe(event => {
      if (
        event === SOCKET_EVENTS.NEW_MESSAGE_NOTIFICATION ||
        event === SOCKET_EVENTS.MESSAGE_RECEIVED ||
        event === SOCKET_EVENTS.MESSAGES_READ
      ) {
        refetchUnread();
      }
    });
  }, [refetchUnread, skipUnread]);

  useEffect(() => {
    const focusedRoute = state.routes[state.index];
    if (!focusedRoute || visibleTabNames.has(focusedRoute.name)) {
      return;
    }

    const fallbackRoute = visibleRoutes[0];
    if (fallbackRoute) {
      navigation.navigate(fallbackRoute.name);
    }
  }, [navigation, state.index, state.routes, visibleRoutes, visibleTabNames]);

  const onPress = useCallback(
    (route, index) => {
      const isFocused = state?.index === index;
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    },
    [state.index, navigation],
  );

  const onLongPress = useCallback(
    route => {
      navigation.emit({
        target: route.key,
        type: 'tabLongPress',
      });
    },
    [navigation],
  );

  const getIcon = (route, isFocused) => {
    const color = isFocused ? COLORS.SUCCESS : COLORS.TEXT_MUTED;
    switch (route.name) {
      case NAVIGATION.TABS.HOME_SCREEN:
        return <HomeIcon color={color} />;
      case NAVIGATION.TABS.MENU_SCREEN:
        return <MenuIcon color={color} />;
      case NAVIGATION.TABS.INVOICES_SCREEN:
        return <InvoicesIcon color={color} />;
      case NAVIGATION.TABS.PROPERTIES_SCREEN:
        return <PropertyIcon color={color} />;
      case NAVIGATION.TABS.MORE_SCREEN:
        return <MoreIcon color={color} />;
      case NAVIGATION.TABS.MESSAGES_SCREEN:
        return <MessagesIcon color={color} />;
      default:
        return null;
    }
  };

  return (
    <View
      style={{
        paddingBottom: insets.bottom || 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.BORDER,
        paddingTop: 10,
        backgroundColor: COLORS.BACKGROUND,
      }}>
      <View style={styles.tabRow}>
        {visibleRoutes.map(route => {
          const index = state.routes.findIndex(item => item.key === route.key);
          const isFocused = state?.index === index;
          const showMessagesBadge =
            route.name === NAVIGATION.TABS.MESSAGES_SCREEN && unreadCount > 0;
          const titleKey =
            route.params?.title || TAB_META_BY_NAME[route.name]?.title || '';

          return (
            <TouchableOpacity
              key={route?.name}
              accessibilityRole="button"
              accessibilityState={{selected: isFocused}}
              accessibilityLabel={route.name}
              activeOpacity={0.75}
              style={styles.tabHit}
              onPress={onPress.bind(null, route, index)}
              onLongPress={onLongPress.bind(null, route)}>
              <View style={styles.tabColumn}>
                <View style={styles.iconWrap}>
                  {getIcon(route, isFocused)}
                  {showMessagesBadge ? <View style={styles.badgeDot} /> : null}
                </View>
                <StyledText
                  color={isFocused ? COLORS.SUCCESS : COLORS.TEXT_MUTED}
                  variant="bold"
                  size={12}>
                  {t(titleKey)}
                </StyledText>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default CustomTabBar;
