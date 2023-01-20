import axiosInstance from '../helpers/axios';

export function useUserRoles() {
  const permissions = localStorage.getItem('permissions').split(',');

  return permissions;
}
