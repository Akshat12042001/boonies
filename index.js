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

  await NotificationService.showNotification(
    0,
    notification.title,
    notification.body,
    remoteMessage.data,
  );
};

onMessage(messaging, showRemoteNotification);
setBackgroundMessageHandler(messaging, async () => {});


function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
