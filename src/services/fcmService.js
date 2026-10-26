import {
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh as subscribeToTokenRefresh,
} from '@react-native-firebase/messaging';
import {Platform} from 'react-native';
import notifee, {EventType} from '@notifee/react-native';

class FCMService {
  constructor() {
    this.messageListener = null;
    this.onTokenRefreshListener = null;
    this.onNotifeeForegroundSub = null;
  }

  static register = (onNotification, onOpenNotification, onTokenRefresh) => {
    FCMService.createNotificationListeners(
      onNotification,
      onOpenNotification,
      onTokenRefresh,
    );
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
        const notification = remoteMessage;
        onOpenNotification(notification, true);
      }
    });

    getInitialNotification(messaging).then(remoteMessage => {
      if (remoteMessage) {
        const notification = remoteMessage;
        onOpenNotification(notification, true);
      }
    });

    this.messageListener = onMessage(messaging, async remoteMessage => {
      if (remoteMessage) {
        let notification = null;
        if (Platform.OS === 'ios') {
          notification = remoteMessage;
        } else {
          notification = remoteMessage;
        }

        // Foreground receipt, not a click
        onNotification(notification, false);
      }
    });

    // Handle presses on Notifee notifications while app is in foreground/background
    try {
      this.onNotifeeForegroundSub = notifee.onForegroundEvent(
        ({type, detail}) => {
          if (type === EventType.PRESS) {
            onOpenNotification(detail?.notification || detail, true);
          }
        },
      );

      this.onNotifeeForegroundSub = notifee.onBackgroundEvent(
        ({type, detail}) => {
          if (type === EventType.PRESS) {
            onOpenNotification(detail?.notification || detail, true);
          }
        },
      );
    } catch (e) {}

    this.onTokenRefreshListener = subscribeToTokenRefresh(
      messaging,
      onTokenRefresh,
    );
  };

  static deregister = () => {
    this.messageListener?.();
    this.onTokenRefreshListener && this.onTokenRefreshListener?.();
    this.onNotifeeForegroundSub && this.onNotifeeForegroundSub?.();
  };
}

export default FCMService;
