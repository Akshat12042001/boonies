import {APIClient} from './client';

const ENDPOINTS = {
  MEMBERS: '/host-staff/members',
};

export const makeGetStaffMembersRequest = (params = {}) => {
  return APIClient()
    .get(ENDPOINTS.MEMBERS, {params})
    .then(res => res.data);
};

export const makeCreateStaffMemberRequest = payload => {
  return APIClient()
    .post(ENDPOINTS.MEMBERS, payload)
    .then(res => res.data);
};

export const makeDeleteStaffMemberRequest = memberId => {
  return APIClient()
    .delete(`${ENDPOINTS.MEMBERS}/${memberId}`)
    .then(res => res.data);
};

export const makeResendStaffInvitationRequest = memberId => {
  return APIClient()
    .post(`${ENDPOINTS.MEMBERS}/${memberId}/resend-invitation`)
    .then(res => res.data);
};

export const makeUpdateStaffMemberRequest = (memberId, payload) => {
  return APIClient()
    .patch(`${ENDPOINTS.MEMBERS}/${memberId}`, payload)
    .then(res => res.data);
};
