import notifee, {AndroidImportance} from '@notifee/react-native';
import {COLORS} from '../constants';
import {getState} from '../redux';

export const CHANNEL_CONST = {
  id: 'custom_channel',
  name: 'fyaar',
  importance: AndroidImportance.HIGH,
};

class NotificationService {
  static showNotification = async (
    id,
    title,
    message,
    data = {},
    options = {},
  ) => {
    const channelId = await notifee.createChannel(CHANNEL_CONST);

    const isNotificationsOn =
      getState().auth?.isNotificationsOn ?? true;
    if (!isNotificationsOn) {
      return;
    }

    await notifee.displayNotification({
      title: title,
      body: message,
      data: data,
      android: {
        channelId,
        smallIcon: 'ic_notify',
        color: COLORS.PRIMARY,
        pressAction: {
          id: 'default',
        },
      },
    });
  };

  static cancel = async notificationId => {
    await notifee.cancelNotification(notificationId);
  };
}

export default NotificationService;
