
export const formatNumber = (value: number) => {
  return `$${new Intl.NumberFormat('de-DE').format(value)}`;
};