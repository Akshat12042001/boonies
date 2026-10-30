import moment from 'moment';

const SUGGESTED_PERCENTS = [-10, -5, 5, 10];

const STATUS_TONES = {
  pending: {
    background: '#FBF4DF',
    color: '#B48A2D',
  },
  countered: {
    background: '#EAF1FF',
    color: '#2F6FED',
  },
  accepted: {
    background: '#EDF4EF',
    color: '#397D2D',
  },
  rejected: {
    background: '#FDEDEC',
    color: '#D14343',
  },
  expired: {
    background: '#F5F6F9',
    color: '#6B826D',
  },
  cancelled: {
    background: '#F5F6F9',
    color: '#6B826D',
  },
};

const toDate = value => {
  if (!value) {
    return null;
  }
  const date = moment(value);
  return date.isValid() ? date : null;
};

export const getDealNights = (checkIn, checkOut) => {
  const start = toDate(checkIn);
  const end = toDate(checkOut);
  if (!start || !end) {
    return 0;
  }
  return Math.max(1, end.diff(start, 'days'));
};

export const formatDealDateRange = (checkIn, checkOut) => {
  const start = toDate(checkIn);
  const end = toDate(checkOut);
  if (!start || !end) {
    return '';
  }

  if (start.year() === end.year()) {
    return `${start.format('D MMM')} → ${end.format('D MMM YYYY')}`;
  }

  return `${start.format('D MMM YYYY')} → ${end.format('D MMM YYYY')}`;
};

export const buildSuggestedDealPrices = (baseAmount = 0) => {
  const amount = Number(baseAmount) || 0;
  return SUGGESTED_PERCENTS.map(percent => {
    const price = Math.max(0, Math.round(amount * (1 + percent / 100)));
    return {
      id: String(percent),
      percent,
      price,
      label: `${percent > 0 ? '+' : ''}${percent}%`,
      isDiscount: percent < 0,
    };
  });
};

export const formatDealStatusLabel = status => {
  const value = String(status || '').trim().toLowerCase();
  if (!value) {
    return 'Pending';
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const getDealStatusTone = status =>
  STATUS_TONES[String(status || '').toLowerCase()] || STATUS_TONES.pending;

export const isDealMessage = message => {
  const type = String(message?.type || message?.messageType || '').toLowerCase();
  return (
    type === 'deal' ||
    Boolean(message?.dealOffer) ||
    Boolean(message?.deal) ||
    Boolean(message?.dealOfferId)
  );
};

export const conversationDealRecord = payload => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  if (payload.deal && typeof payload.deal === 'object') {
    return payload.deal;
  }

  if (Array.isArray(payload.deals)) {
    return payload.deals[0] || null;
  }

  if (Array.isArray(payload?.data?.deals)) {
    return payload.data.deals[0] || null;
  }

  if (payload.data?.deal && typeof payload.data.deal === 'object') {
    return payload.data.deal;
  }

  if (payload.data && typeof payload.data === 'object' && payload.data.id) {
    return payload.data;
  }

  if (payload.id) {
    return payload;
  }

  return null;
};

export const mapDealFromMessage = (message = {}, currentUserId = '') => {
  const offer =
    message?.dealOffer ||
    message?.deal ||
    message?.metadata?.dealOffer ||
    message?.data?.dealOffer ||
    {};

  const checkIn = offer.checkIn || message.checkIn || '';
  const checkOut = offer.checkOut || message.checkOut || '';
  const offeredPrice = Number(offer.offeredPrice ?? message.offeredPrice ?? 0) || 0;
  const guests = Number(offer.guests ?? message.guests) || 0;
  const nights = getDealNights(checkIn, checkOut) || 1;
  const status = String(offer.status || message.status || 'pending')
    .trim()
    .toLowerCase();
  const isLatest = Boolean(offer.isLatest);
  const offeredById =
    offer.offeredById ||
    message.offeredById ||
    message.senderId ||
    '';
  const isReceived =
    Boolean(offeredById) &&
    Boolean(currentUserId) &&
    String(offeredById) !== String(currentUserId);
  const isPendingLatest = status === 'pending' && isLatest;

  return {
    id: String(offer.id || message.dealOfferId || message.id || ''),
    dealId: String(offer.dealId || message.dealId || ''),
    offerId: String(offer.id || message.dealOfferId || ''),
    status,
    statusLabel: formatDealStatusLabel(status),
    statusTone: getDealStatusTone(status),
    directionLabel: isReceived ? 'Received' : 'Sent',
    isReceived,
    isLatest,
    checkIn,
    checkOut,
    dateRangeLabel: formatDealDateRange(checkIn, checkOut),
    guests,
    nights,
    offeredPrice,
    advancePayment: offer.advancePayment,
    perNight: nights > 0 ? Math.round(offeredPrice / nights) : offeredPrice,
    expiresAt: offer.expiresAt || '',
    suggestions: buildSuggestedDealPrices(offeredPrice),
    // Pending + latest: Accept/Reject for received, Revise for both sides.
    isActionable: isPendingLatest,
    canRespond: isPendingLatest && isReceived,
    canRevise: isPendingLatest,
  };
};
