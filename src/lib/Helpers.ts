export const timeFormat = (duration: number): string => {
  if (!duration) {
    return '00:00';
  }
  const dateTimeFormat = Intl.DateTimeFormat('ru-RU', { minute: '2-digit', second: '2-digit' });
  return dateTimeFormat.format(duration);
};
