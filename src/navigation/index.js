import React, {useCallback, useEffect, useRef} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import AuthenticationStack from './stacks/authentication';
import {NavigationService} from '../services';
import {createStackNavigator} from '@react-navigation/stack';
import config from './config';
import {ENUMS, NAVIGATION} from '../constants';
import BottomTabs from './bottomTabs';
import {useSelector} from 'react-redux';
import CommonStack from './stacks/common';
import {FCMService} from '../services';
import {makeMarkNotificationReadRequest} from '../api/common';
import {
  refreshConversationsTabCache,
  refreshUnreadAndNotificationsCache,
} from '../api/messaging';

const Stack = createStackNavigator();

const setNavigatorRef = ref => NavigationService.setNavigatorRef(ref);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid = value => UUID_PATTERN.test(String(value || '').trim());

const markNotificationReadIfNeeded = notificationId => {
  // Only backend UUIDs — never FCM outer messageId ("0:…%…").
  if (!isUuid(notificationId)) {
    return;
  }

  makeMarkNotificationReadRequest(notificationId)
    .then(() => refreshUnreadAndNotificationsCache())
    .catch(() => {});
};

const shouldRefreshInboxFromPush = (data = {}) => {
  const type = String(data.type || '').trim().toLowerCase();
  return (
    type === ENUMS.NOTIFICATION_TYPE.DEAL ||
    type === ENUMS.NOTIFICATION_TYPE.NEW_DEAL ||
    type === ENUMS.NOTIFICATION_TYPE.MESSAGE ||
    type === ENUMS.NOTIFICATION_TYPE.NEW_MESSAGE
  );
};

const AppNavigator = () => {
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
  const isLoggedInRef = useRef(isLoggedIn);
  isLoggedInRef.current = isLoggedIn;

  const navigateFromNotification = useCallback((data = {}, notification = {}) => {
    if (!isLoggedInRef.current) {
      return;
    }

    const conversationId = data.conversationId || data.conversation_id;
    const dealId = data.dealId || data.deal_id;
    // Prefer ids from `data` only — never Notifee/FCM outer messageId ("0:…%…").
    const notificationId =
      data.notificationId || data.notification_id || data.messageId || '';
    const type = String(data.type || '').trim().toLowerCase();
    const title = String(notification?.title || data.title || '');
    const name = title.replace(/^New message from\s+/i, '').trim() || 'Guest';

    markNotificationReadIfNeeded(String(notificationId).trim());

    switch (type) {
      case ENUMS.NOTIFICATION_TYPE.DEAL:
      case ENUMS.NOTIFICATION_TYPE.NEW_DEAL: {
        if (!dealId) {
          break;
        }
        NavigationService.navigate(NAVIGATION.STACKS.COMMON, {
          screen: NAVIGATION.COMMON.DEAL_PREVIEW_SCREEN,
          params: {
            dealId: String(dealId),
          },
        });
        break;
      }
      case ENUMS.NOTIFICATION_TYPE.MESSAGE:
      case ENUMS.NOTIFICATION_TYPE.NEW_MESSAGE: {
        if (!conversationId) {
          break;
        }
        NavigationService.navigate(NAVIGATION.STACKS.COMMON, {
          screen: NAVIGATION.COMMON.CHAT_SCREEN,
          params: {
            conversationId: String(conversationId),
            name,
          },
        });
        break;
      }
      default:
        break;
    }
  }, []);

  const onNotificationHandler = useCallback(
    (payload, openByClick = false) => {
      // FCM passes the full remoteMessage: { notification, data, ... }
      // Notifee press passes detail.notification: { title, body, data, ... }
      const notification = payload?.notification || payload;
      const data = payload?.data || notification?.data || {};

      // Foreground deal/message pushes: refresh inbox without joining rooms.
      if (!openByClick) {
        if (isLoggedInRef.current && shouldRefreshInboxFromPush(data)) {
          refreshConversationsTabCache().catch(() => {});
        }
        return;
      }

      navigateFromNotification(data, notification);
    },
    [navigateFromNotification],
  );

  const handlerRef = useRef(onNotificationHandler);
  handlerRef.current = onNotificationHandler;

  useEffect(() => {
    const stableHandler = (payload, openByClick) => {
      handlerRef.current?.(payload, openByClick);
    };

    FCMService.register(stableHandler, stableHandler, () => {});

    return () => {
      FCMService.deregister();
    };
  }, []);

  return (
    <NavigationContainer ref={setNavigatorRef}>
      <Stack.Navigator screenOptions={config}>
        {isLoggedIn ? (
          <>
            <Stack.Screen
              name={NAVIGATION.STACKS.TABS}
              component={BottomTabs}
            />
            <Stack.Screen
              name={NAVIGATION.STACKS.COMMON}
              component={CommonStack}
            />
          </>
        ) : (
          <Stack.Screen
            name={NAVIGATION.STACKS.AUTH}
            component={AuthenticationStack}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
