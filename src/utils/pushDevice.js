import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import {getMessaging, getToken} from '@react-native-firebase/messaging';
import {
  makeRegisterPushDeviceRequest,
  makeUnregisterPushDeviceRequest,
} from '../api/push';

const DEVICE_ID_KEY = 'push.deviceId';
const DEVICE_ID_PATTERN = /[^a-zA-Z0-9._:-]/g;
const APP_VERSION_PATTERN = /[^a-zA-Z0-9._+\-()]/g;

const sanitizeDeviceId = value =>
  String(value || '')
    .replace(DEVICE_ID_PATTERN, '')
    .slice(0, 128);

const sanitizeAppVersion = value =>
  String(value || '')
    .replace(APP_VERSION_PATTERN, '')
    .slice(0, 32);

export const getPushDeviceId = async () => {
  try {
    const cached = await AsyncStorage.getItem(DEVICE_ID_KEY);
    const sanitizedCached = sanitizeDeviceId(cached);
    if (sanitizedCached) {
      return sanitizedCached;
    }
  } catch (error) {
    // Fall through to DeviceInfo.
  }

  let uniqueId = '';
  try {
    uniqueId = await DeviceInfo.getUniqueId();
  } catch (error) {
    uniqueId = '';
  }

  const deviceId =
    sanitizeDeviceId(uniqueId) ||
    sanitizeDeviceId(`device-${Date.now()}`);

  try {
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  } catch (error) {
    // Non-blocking cache write.
  }

  return deviceId;
};

export const buildPushDevicePayload = async token => {
  const deviceId = await getPushDeviceId();
  const appVersion = sanitizeAppVersion(DeviceInfo.getVersion());

  return {
    token: String(token || ''),
    platform: Platform.OS === 'ios' ? 'ios' : 'android',
    deviceId,
    appVersion: appVersion || '0.0.0',
  };
};

export const registerPushDevice = async () => {
  const token = await getToken(getMessaging());
  if (!token) {
    return null;
  }

  const payload = await buildPushDevicePayload(token);
  if (!payload.token || !payload.deviceId) {
    return null;
  }

  return makeRegisterPushDeviceRequest(payload);
};

export const unregisterPushDevice = async () => {
  const deviceId = await getPushDeviceId();
  if (!deviceId) {
    return null;
  }

  return makeUnregisterPushDeviceRequest({deviceId});
};
