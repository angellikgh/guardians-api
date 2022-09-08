// GUARDIAN LIMITS: 19 char max; no apostrophes, commas, or dashes.
export const formatForGuardianAddress = (address?: string | null) => {
  if (!address) return '';

  const regex = /["'`,_-]/g;
  return address.replace(regex, ' ').slice(0, 19);
};
