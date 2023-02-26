const timeGenerate = (format?: string, time?: string | number) => {
  const f = format || 'hh:mm:ss';
  const date = (time === undefined) ? new Date() : new Date(time);

  const year = date.getFullYear().toString();

  const month = (date.getMonth() + 1)
    .toFixed(0)
    .padStart(2, '0');

  const day = date.getDate()
    .toFixed(0)
    .padStart(2, '0');

  const hour = date.getHours()
    .toFixed(0)
    .padStart(2, '0');

  const min = date.getMinutes()
    .toFixed(0)
    .padStart(2, '0');

  const sec = date.getSeconds()
    .toFixed(0)
    .padStart(2, '0');

  const ping = date.getMilliseconds()
    .toFixed(0)
    .padStart(3, '0');

  return f
    .replace(/YY/g, year)
    .replace(/MM/g, month)
    .replace(/DD/g, day)
    .replace(/hh/g, hour)
    .replace(/mm/g, min)
    .replace(/ss/g, sec)
    .replace(/pp/g, ping);
};

export const timeDisplay = (format?: string, time?: string | number): string => `\u001b[47m\u001b[30m${timeGenerate(format, time)}\u001b[0m`;
