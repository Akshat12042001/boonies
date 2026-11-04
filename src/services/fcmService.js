import {
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh as subscribeToTokenRefresh,
} from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';

class FCMService {
  static messageListener = null;
  static onTokenRefreshListener = null;
  static onNotifeeForegroundSub = null;
  static onNotifeeBackgroundSub = null;
  static isRegistered = false;

  static register = (onNotification, onOpenNotification, onTokenRefresh) => {
    if (FCMService.isRegistered) {
      FCMService.deregister();
    }

    FCMService.createNotificationListeners(
      onNotification,
      onOpenNotification,
      onTokenRefresh,
    );
    FCMService.isRegistered = true;
  };

  static createNotificationListeners = (
    onNotification,
    onOpenNotification,
    onTokenRefresh,
  ) => {
    const messaging = getMessaging();

    getToken(messaging)
      .then(res => {
        onTokenRefresh?.(res);
      })
      .catch(() => {});

    onNotificationOpenedApp(messaging, remoteMessage => {
      if (remoteMessage) {
        onOpenNotification?.(remoteMessage, true);
      }
    });

    getInitialNotification(messaging)
      .then(remoteMessage => {
        if (remoteMessage) {
          onOpenNotification?.(remoteMessage, true);
        }
      })
      .catch(() => {});

    // Foreground FCM delivery (also handled for display in index.js).
    FCMService.messageListener = onMessage(messaging, async remoteMessage => {
      if (remoteMessage) {
        onNotification?.(remoteMessage, false);
      }
    });

    try {
      FCMService.onNotifeeForegroundSub = notifee.onForegroundEvent(
        ({type, detail}) => {
          if (type === EventType.PRESS) {
            onOpenNotification?.(detail?.notification || detail, true);
          }
        },
      );

      FCMService.onNotifeeBackgroundSub = notifee.onBackgroundEvent(
        async ({type, detail}) => {
          if (type === EventType.PRESS) {
            onOpenNotification?.(detail?.notification || detail, true);
          }
        },
      );
    } catch (e) {}

    FCMService.onTokenRefreshListener = subscribeToTokenRefresh(
      messaging,
      token => onTokenRefresh?.(token),
    );
  };

  static deregister = () => {
    FCMService.messageListener?.();
    FCMService.onTokenRefreshListener?.();
    FCMService.onNotifeeForegroundSub?.();
    FCMService.onNotifeeBackgroundSub?.();
    FCMService.messageListener = null;
    FCMService.onTokenRefreshListener = null;
    FCMService.onNotifeeForegroundSub = null;
    FCMService.onNotifeeBackgroundSub = null;
    FCMService.isRegistered = false;
  };
}

export default FCMService;
