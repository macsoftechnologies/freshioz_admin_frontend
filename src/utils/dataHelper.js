/**
 * Utility to safely extract an array from API responses whether wrapped in { data: [...] },
 * { users: [...] }, { onboardings: [...] }, or returned directly as an array.
 */
export const extractList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.users)) return res.users;
  if (Array.isArray(res.employees)) return res.employees;
  if (Array.isArray(res.onboardings)) return res.onboardings;
  if (Array.isArray(res.roles)) return res.roles;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.results)) return res.results;
  if (res.data && typeof res.data === 'object') return extractList(res.data);
  return [];
};
