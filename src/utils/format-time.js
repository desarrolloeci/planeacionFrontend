import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';









dayjs.extend(duration);
dayjs.extend(relativeTime);



export const formatPatterns = {
  dateTime: 'DD MMM YYYY h:mm a', 
  date: 'DD MMM YYYY', 
  time: 'h:mm a', 
  split: {
    dateTime: 'DD/MM/YYYY h:mm a', 
    date: 'DD/MM/YYYY', 
  },
  paramCase: {
    dateTime: 'DD-MM-YYYY h:mm a', 
    date: 'DD-MM-YYYY', 
  },
};

const isValidDate = (date) => date !== null && date !== undefined && dayjs(date).isValid();



export function today(template) {
  return dayjs(new Date()).startOf('day').format(template);
}







export function fDateTime(date, template) {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  return dayjs(date).format(template ?? formatPatterns.dateTime);
}







export function fDate(date, template) {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  return dayjs(date).format(template ?? formatPatterns.date);
}







export function fTime(date, template) {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  return dayjs(date).format(template ?? formatPatterns.time);
}







export function fTimestamp(date) {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  return dayjs(date).valueOf();
}







export function fToNow(date) {
  if (!isValidDate(date)) {
    return 'Invalid date';
  }

  return dayjs(date).toNow(true);
}







export function fIsBetween(inputDate, startDate, endDate) {
  if (!isValidDate(inputDate) || !isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  const formattedInputDate = fTimestamp(inputDate);
  const formattedStartDate = fTimestamp(startDate);
  const formattedEndDate = fTimestamp(endDate);

  if (
    formattedInputDate === 'Invalid date' ||
    formattedStartDate === 'Invalid date' ||
    formattedEndDate === 'Invalid date'
  ) {
    return false;
  }

  return formattedInputDate >= formattedStartDate && formattedInputDate <= formattedEndDate;
}







export function fIsAfter(startDate, endDate) {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  return dayjs(startDate).isAfter(endDate);
}







export function fIsSame(startDate, endDate, unitToCompare) {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  return dayjs(startDate).isSame(endDate, unitToCompare ?? 'year');
}





export function fDateRangeShortLabel(startDate, endDate, initial) {
  if (!isValidDate(startDate) || !isValidDate(endDate) || fIsAfter(startDate, endDate)) {
    return 'Invalid date';
  }

  let label = `${fDate(startDate)} - ${fDate(endDate)}`;

  if (initial) {
    return label;
  }

  const isSameYear = fIsSame(startDate, endDate, 'year');
  const isSameMonth = fIsSame(startDate, endDate, 'month');
  const isSameDay = fIsSame(startDate, endDate, 'day');

  if (isSameYear && !isSameMonth) {
    label = `${fDate(startDate, 'DD MMM')} - ${fDate(endDate)}`;
  } else if (isSameYear && isSameMonth && !isSameDay) {
    label = `${fDate(startDate, 'DD')} - ${fDate(endDate)}`;
  } else if (isSameYear && isSameMonth && isSameDay) {
    label = `${fDate(endDate)}`;
  }

  return label;
}



export function fAdd({
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}) {
  const result = dayjs()
    .add(
      dayjs.duration({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
      })
    )
    .format();

  return result;
}





export function fSub({
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}) {
  const result = dayjs()
    .subtract(
      dayjs.duration({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
      })
    )
    .format();

  return result;
}
