import moment from 'moment';

export const toCalendarDateString = date =>
  moment(date).format('YYYY-MM-DD');

export const parseCalendarDateString = dateString =>
  moment(dateString, 'YYYY-MM-DD').startOf('day').toDate();

export const getTodayCalendarString = () => toCalendarDateString(new Date());

export const formatCompactPrice = value => {
  const amount = Number(value);
  if (Number.isNaN(amount) || amount <= 0) {
    return '';
  }
  if (amount >= 1000) {
    const thousands = amount / 1000;
    const label =
      amount % 1000 === 0
        ? String(Math.round(thousands))
        : thousands.toFixed(1).replace(/\.0$/, '');
    return `₹${label}K`;
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

export const formatCalendarDisplayDate = dateString =>
  moment(dateString, 'YYYY-MM-DD').format('MMM D, YYYY');
