export function useUserRoles() {
  const permissions = localStorage.getItem('permissions').split(',');

  return permissions;
}
