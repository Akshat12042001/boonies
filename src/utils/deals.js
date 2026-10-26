const formatDealStatus = status => {
  const value = String(status || '').replace(/[_-]/g, ' ').trim();

  if (!value) {
    return '';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const mapHostDeal = deal => {
  const terms = deal?.currentTerms || {};
  const initiatedByGuest =
    !!deal?.initiatedById && deal.initiatedById === deal?.guestId;

  return {
    id: String(deal?.id || ''),
    homestayTitle: deal?.conversation?.homestay?.title || '',
    guestRole: initiatedByGuest ? 'guest' : 'host',
    checkIn: terms.checkIn || '',
    checkOut: terms.checkOut || '',
    offeredPrice: Number(terms.offeredPrice) || 0,
    adults: Number(terms.guests) || 0,
    status: formatDealStatus(deal?.status),
  };
};

export const mapHostDealsResponse = response => ({
  deals: (Array.isArray(response?.data) ? response.data : []).map(mapHostDeal),
  stats: {
    total: Number(response?.stats?.total) || 0,
    pending: Number(response?.stats?.pending) || 0,
    accepted: Number(response?.stats?.accepted) || 0,
    rejected: Number(response?.stats?.rejected) || 0,
  },
  page: Number(response?.meta?.page) || 1,
  totalPages: Number(response?.meta?.totalPages) || 1,
});
