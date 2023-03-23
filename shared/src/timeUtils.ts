import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';

dayjs.extend(relativeTime);
dayjs.extend(duration);

export const timeFromNow = (date: Parameters<typeof dayjs>['0']): string => dayjs(date).fromNow();

export const timeDuration = (seconds: number): string => dayjs.duration({ seconds }).humanize();
