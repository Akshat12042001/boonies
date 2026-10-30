import {APIClient} from './client';

const ENDPOINTS = {
  DEALS: '/deals',
};

export const parseDealActionResponse = response => {
  const root = response?.data && typeof response.data === 'object'
    ? response.data
    : response || {};
  const deal =
    root.deal && typeof root.deal === 'object'
      ? root.deal
      : root.id
        ? root
        : null;
  const latestOffer =
    root.latestOffer ||
    deal?.latestOffer ||
    root.offer ||
    deal?.currentOffer ||
    null;
  const newMessage = root.newMessage || root.message || null;
  const conversationId =
    deal?.conversationId ||
    deal?.conversation?.id ||
    newMessage?.conversationId ||
    root.conversationId ||
    '';

  return {
    deal,
    latestOffer,
    newMessage,
    conversationId: conversationId ? String(conversationId) : '',
  };
};

export const makeGetDealRequest = dealId => {
  return APIClient()
    .get(`${ENDPOINTS.DEALS}/${dealId}`)
    .then(res => res.data);
};

export const makeGetConversationDealRequest = conversationId => {
  return APIClient()
    .get(`${ENDPOINTS.DEALS}/conversation/${conversationId}`)
    .then(res => res.data);
};

export const makeGetDealOffersRequest = dealId => {
  return APIClient()
    .get(`${ENDPOINTS.DEALS}/${dealId}/offers`)
    .then(res => res.data);
};

export const makeCreateDealRequest = payload => {
  return APIClient()
    .post(ENDPOINTS.DEALS, payload)
    .then(res => res.data);
};

export const makeAddDealOfferRequest = (dealId, payload) => {
  return APIClient()
    .post(`${ENDPOINTS.DEALS}/${dealId}/offers`, payload)
    .then(res => res.data);
};

export const makeCounterDealRequest = (dealId, payload) => {
  return APIClient()
    .post(`${ENDPOINTS.DEALS}/${dealId}/counter`, payload)
    .then(res => res.data);
};

export const makeAcceptDealRequest = (dealId, payload = {}) => {
  return APIClient()
    .post(`${ENDPOINTS.DEALS}/${dealId}/accept`, payload)
    .then(res => res.data);
};

export const makeRejectDealRequest = (dealId, payload = {}) => {
  return APIClient()
    .post(`${ENDPOINTS.DEALS}/${dealId}/reject`, payload)
    .then(res => res.data);
};

export const makeCancelDealRequest = (dealId, payload = {}) => {
  return APIClient()
    .post(`${ENDPOINTS.DEALS}/${dealId}/cancel`, payload)
    .then(res => res.data);
};

export const buildDealOfferPayload = (deal, offeredPrice, note) => {
  const terms = {
    checkIn: deal?.checkIn,
    checkOut: deal?.checkOut,
    guests: Number(deal?.guests) || 1,
    offeredPrice: Number(offeredPrice) || 0,
  };

  if (deal?.advancePayment != null && deal.advancePayment !== '') {
    terms.advancePayment = Number(deal.advancePayment);
  }

  const payload = {terms};
  if (note) {
    payload.note = note;
  }
  return payload;
};
