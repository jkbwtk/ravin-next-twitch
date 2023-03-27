import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

dayjs.extend(relativeTime);
dayjs.extend(duration);

export const timeFromNow = (date: Parameters<typeof dayjs>['0']): string => dayjs(date).fromNow();

export const timeDuration = (seconds: number): string => dayjs.duration({ seconds }).humanize();

export const timeframe = (dateStart: number, dateEnd: number): string => {
  const start = dayjs(dateStart);
  const end = dayjs(dateEnd);

  if (start.year() !== end.year()) {
    return `${start.format('YYYY/MM/D')} - ${end.format('YYYY/MM/D')}`;
  }

  if (start.month() !== end.month()) {
    return `${start.format('MM/D')} - ${end.format('MM/D')}`;
  }

  if (start.date() !== end.date()) {
    return `${start.format('MM/D')} - ${end.format('MM/D')}`;
  }

  return `${start.format('HH:mm')} - ${end.format('HH:mm')}`;
};
