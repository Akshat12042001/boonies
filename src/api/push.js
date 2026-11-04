import {APIClient} from './client';

const ENDPOINTS = {
  DEVICES: '/push/devices',
};

export const makeRegisterPushDeviceRequest = payload => {
  return APIClient()
    .post(ENDPOINTS.DEVICES, payload)
    .then(res => res.data);
};

export const makeUnregisterPushDeviceRequest = payload => {
  return APIClient()
    .delete(ENDPOINTS.DEVICES, {data: payload})
    .then(res => res.data);
};
