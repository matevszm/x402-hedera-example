export const tinybarToHbar = (atomic: string): string => {
  const hbar = Number(atomic) / 1e8;
  return hbar.toString();
};
