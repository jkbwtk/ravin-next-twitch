export const truncateNumber = (num = 0): string => {
  const suffixes = ['', 'K', 'M', 'B', 'T', 'Q'];
  const digits = Math.abs(Math.round(num)).toString().length;
  const suffixNum = Math.floor((digits - 1) / 3);

  const truncatedNumber = Math.round(num / 10 ** (suffixNum * 3 - 1)) / 10;

  return `${truncatedNumber}${suffixes[suffixNum]}`;
};
