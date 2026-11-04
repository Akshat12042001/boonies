/**
 * @format
 */

import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import NotificationService from './src/services/notificationService';
import {
  getMessaging,
  onMessage,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';

if (__DEV__) {
  import('./reactotron.config').then(() =>
    console.log('[REACTOTRON] - Configured!'),
  );
}


const messaging = getMessaging();

const showRemoteNotification = async remoteMessage => {
  console.log('Remote message:', remoteMessage);
  const notification = remoteMessage?.notification;
  if (!notification) {
    return;
  }

  const data = remoteMessage?.data || {};
  // Use backend id from data only — never the outer FCM messageId
  // (e.g. "0:1793…%…"), which is not a valid app/notification UUID.
  const dataMessageId = data.messageId || data.notificationId || '';

  // Android Notifee requires a numeric display id; keep the real id in `data`.
  const displayId = String(Date.now());

  await NotificationService.showNotification(
    displayId,
    notification.title,
    notification.body,
    {
      ...data,
      ...(dataMessageId ? {messageId: String(dataMessageId)} : {}),
    },
  );
};

// Register once — Fast Refresh can otherwise stack listeners.
if (!global.__BOONIES_FCM_FOREGROUND_BOUND__) {
  global.__BOONIES_FCM_FOREGROUND_BOUND__ = true;
  onMessage(messaging, showRemoteNotification);
  setBackgroundMessageHandler(messaging, async () => {});
}


function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
