import moment from 'moment';

export const toCalendarDateString = date =>
  moment(date).format('YYYY-MM-DD');

export const parseCalendarDateString = dateString =>
  moment(dateString, 'YYYY-MM-DD').startOf('day').toDate();

export const getTodayCalendarString = () => toCalendarDateString(new Date());

export const getHomestayBlockedEntries = response => {
  const source = response?.data ?? response ?? [];
  const items = Array.isArray(source) ? source : [];

  return items
    .map(item => {
      const startDate = item?.startDate
        ? toCalendarDateString(item.startDate)
        : '';
      const endDate = item?.endDate
        ? toCalendarDateString(item.endDate)
        : startDate;

      if (!item?.id || !startDate) {
        return null;
      }

      return {
        id: String(item.id),
        homestayId: item.homestayId || '',
        type: String(item.blockType || item.type || 'manual').toLowerCase(),
        startDate,
        endDate,
        reason: item.reason || '',
      };
    })
    .filter(Boolean);
};

export const getBlockedDayStatuses = (entries = []) => {
  const statuses = {};

  entries.forEach(entry => {
    if (!entry?.startDate) {
      return;
    }

    const cursor = moment(entry.startDate, 'YYYY-MM-DD').startOf('day');
    const end = moment(entry.endDate || entry.startDate, 'YYYY-MM-DD').startOf(
      'day',
    );

    if (!cursor.isValid() || !end.isValid() || cursor.isAfter(end, 'day')) {
      return;
    }

    while (cursor.isSameOrBefore(end, 'day')) {
      statuses[cursor.format('YYYY-MM-DD')] = 'blocked';
      cursor.add(1, 'day');
    }
  });

  return statuses;
};

export const getHostCalendarBookings = response => {
  const source = response?.data ?? response ?? [];
  const items = Array.isArray(source) ? source : [];

  return items
    .map(booking => {
      const checkIn = booking?.checkIn
        ? toCalendarDateString(booking.checkIn)
        : booking?.currentOffer?.checkIn
          ? toCalendarDateString(booking.currentOffer.checkIn)
          : '';
      const checkOut = booking?.checkOut
        ? toCalendarDateString(booking.checkOut)
        : booking?.currentOffer?.checkOut
          ? toCalendarDateString(booking.currentOffer.checkOut)
          : '';

      if (!booking?.id || !checkIn) {
        return null;
      }

      const start = moment(checkIn, 'YYYY-MM-DD').startOf('day');
      const endExclusive = checkOut
        ? moment(checkOut, 'YYYY-MM-DD').startOf('day')
        : start.clone().add(1, 'day');

      if (!start.isValid() || !endExclusive.isValid()) {
        return null;
      }

      const nights = Math.max(1, endExclusive.diff(start, 'days'));
      const endDate = start
        .clone()
        .add(nights - 1, 'days')
        .format('YYYY-MM-DD');
      const guestName = [
        booking?.guest?.firstName,
        booking?.guest?.lastName,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

      return {
        id: String(booking.id),
        homestayId: String(booking.homestayId || booking?.homestay?.id || ''),
        guestName: guestName || 'Guest',
        guestEmail: String(booking?.guest?.email || '').trim(),
        guests: Number(booking?.currentOffer?.guests) || 1,
        offeredPrice: Number(booking?.currentOffer?.offeredPrice) || 0,
        startDate: checkIn,
        endDate,
        checkOut: checkOut || endExclusive.format('YYYY-MM-DD'),
        nights,
      };
    })
    .filter(Boolean);
};

export const mergeCalendarDayStatuses = (
  blockedStatuses = {},
  bookings = [],
) => {
  const statuses = {...blockedStatuses};

  bookings.forEach(booking => {
    if (!booking?.startDate) {
      return;
    }

    const cursor = moment(booking.startDate, 'YYYY-MM-DD').startOf('day');
    const end = moment(booking.endDate || booking.startDate, 'YYYY-MM-DD').startOf(
      'day',
    );

    if (!cursor.isValid() || !end.isValid() || cursor.isAfter(end, 'day')) {
      return;
    }

    while (cursor.isSameOrBefore(end, 'day')) {
      const key = cursor.format('YYYY-MM-DD');
      if (statuses[key] !== 'blocked') {
        statuses[key] = 'booked';
      }
      cursor.add(1, 'day');
    }
  });

  return statuses;
};

export const getBlockedEntriesStats = (entries = [], bookingsCount = 0) => {
  const manual = entries.filter(entry => entry.type === 'manual').length;
  const recurring = entries.filter(entry => entry.type === 'recurring').length;

  return {
    blocks: entries.length,
    manual,
    recurring,
    booked: Number(bookingsCount) || 0,
  };
};

export const hasOffSeasonPrices = listing => {
  const prices = [
    listing?.offSeasonPricePerDay,
    listing?.offSeasonPricePerWeek,
    listing?.offSeasonPricePerMonth,
  ];

  return prices.some(price => {
    if (price === null || price === undefined || price === '') {
      return false;
    }
    const amount = Number(price);
    return !Number.isNaN(amount) && amount > 0;
  });
};

export const getOffSeasonPeriods = response => {
  const source = response?.data ?? response ?? [];
  const items = Array.isArray(source) ? source : [];

  return items
    .map(item => {
      const startMonth = Number(item?.startMonth);
      const startDay = Number(item?.startDay);
      const endMonth = Number(item?.endMonth);
      const endDay = Number(item?.endDay);

      if (
        !item?.id ||
        !startMonth ||
        !startDay ||
        !endMonth ||
        !endDay
      ) {
        return null;
      }

      return {
        id: String(item.id),
        homestayId: item.homestayId || '',
        startMonth,
        startDay,
        endMonth,
        endDay,
      };
    })
    .filter(Boolean);
};

export const formatOffSeasonPeriodLabel = period => {
  if (!period) {
    return '';
  }

  const startLabel = moment({
    year: 2024,
    month: period.startMonth - 1,
    day: period.startDay,
  }).format('MMMM D');
  const endLabel = moment({
    year: 2024,
    month: period.endMonth - 1,
    day: period.endDay,
  }).format('MMMM D');

  return `${startLabel} – ${endLabel}`;
};

export const formatCompactPrice = value => {
  const amount = Number(value);
  if (Number.isNaN(amount) || amount <= 0) {
    return '';
  }
  // Keep short for calendar day cells (e.g. ₹3K) so the label stays on one line.
  if (amount >= 1000) {
    return `₹${Math.round(amount / 1000)}K`;
  }
  return `₹${Math.round(amount)}`;
};

export const getInclusiveDayCount = (startDateString, endDateString) => {
  if (!startDateString || !endDateString) {
    return 0;
  }
  const start = moment(startDateString, 'YYYY-MM-DD').startOf('day');
  const end = moment(endDateString, 'YYYY-MM-DD').startOf('day');
  if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
    return 0;
  }
  return end.diff(start, 'days') + 1;
};

export const isDateInRange = (dateString, startDateString, endDateString) => {
  if (!dateString || !startDateString) {
    return false;
  }
  if (!endDateString) {
    return dateString === startDateString;
  }
  return dateString >= startDateString && dateString <= endDateString;
};

export const isUnavailableCalendarDate = (dateString, dayStatuses = {}) => {
  const status = String(dayStatuses?.[dateString] || '').toLowerCase();
  return status === 'blocked' || status === 'booked';
};

export const rangeHasUnavailableDate = (
  startDateString,
  endDateString,
  dayStatuses = {},
) => {
  if (!startDateString || !endDateString) {
    return false;
  }

  const cursor = moment(startDateString, 'YYYY-MM-DD').startOf('day');
  const end = moment(endDateString, 'YYYY-MM-DD').startOf('day');

  if (!cursor.isValid() || !end.isValid() || cursor.isAfter(end, 'day')) {
    return false;
  }

  while (cursor.isSameOrBefore(end, 'day')) {
    if (isUnavailableCalendarDate(cursor.format('YYYY-MM-DD'), dayStatuses)) {
      return true;
    }
    cursor.add(1, 'day');
  }

  return false;
};

export const formatCalendarDisplayDate = dateString =>
  moment(dateString, 'YYYY-MM-DD').format('MMM D, YYYY');
