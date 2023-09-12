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

export const timeFromNowAlt = (date: Parameters<typeof dayjs>['0']): string => {
  if (date === null) return 'never';

  const now = dayjs();
  const then = dayjs(date);

  const diffSeconds = now.diff(then, 'seconds');
  const diffMinutes = now.diff(then, 'minutes');
  const diffHours = now.diff(then, 'hours');
  const diffDays = now.diff(then, 'days');
  const diffMonths = now.diff(then, 'months');
  const diffYears = now.diff(then, 'years');

  if (diffYears > 0) return `${diffYears} year${diffMinutes === 1 ? '' : 's'} ago`;
  if (diffMonths > 0) return `${diffMonths % 12} month${diffMinutes === 1 ? '' : 's'} ago`;
  if (diffDays > 0) return `${diffDays % 30} day${diffMinutes === 1 ? '' : 's'} ago`;
  if (diffHours > 0) return `${diffHours % 24} hour${diffMinutes === 1 ? '' : 's'} ago`;
  if (diffMinutes > 0) return `${diffMinutes % 60} minute${diffMinutes === 1 ? '' : 's'} ago`;
  if (diffSeconds > 0) return `${diffSeconds % 60} second${diffMinutes === 1 ? '' : 's'} ago`;

  return 'just now';
};

export const timeLeftTo = (date: Parameters<typeof dayjs>['0']): string => {
  if (date === null) return 'never';

  const now = dayjs();
  const then = dayjs(date);

  const diffSeconds = then.diff(now, 'seconds');
  const diffMinutes = then.diff(now, 'minutes');
  const diffHours = then.diff(now, 'hours');
  const diffDays = then.diff(now, 'days');
  const diffMonths = then.diff(now, 'months');
  const diffYears = then.diff(now, 'years');

  if (diffYears > 0) return `${diffYears} year${diffMinutes === 1 ? '' : 's'}`;
  if (diffMonths > 0) return `${diffMonths % 12} month${diffMinutes === 1 ? '' : 's'}`;
  if (diffDays > 0) return `${diffDays % 30} day${diffMinutes === 1 ? '' : 's'}`;
  if (diffHours > 0) return `${diffHours % 24} hour${diffMinutes === 1 ? '' : 's'}`;
  if (diffMinutes > 0) return `${diffMinutes % 60} minute${diffMinutes === 1 ? '' : 's'}`;
  if (diffSeconds > 0) return `${diffSeconds % 60} second${diffMinutes === 1 ? '' : 's'}`;

  return 'right now';
};

export const timeDiff = (date: Parameters<typeof dayjs>['0'], prefix = true): string => {
  const now = dayjs();
  const then = dayjs(date ?? now);

  const sign = then.isAfter(now) ? '-' : '+';
  const time = [
    then.diff(now, 'hours'),
    then.diff(now, 'minutes') % 60,
    then.diff(now, 'seconds') % 60,
  ]
    .map(Math.abs)
    .map((n) => n.toString().padStart(2, '0'))
    .join(':');

  return `${prefix ? sign : ''}${time}`;
};
