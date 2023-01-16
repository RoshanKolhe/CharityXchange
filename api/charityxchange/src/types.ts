import {PermissionKeys} from './authorization/permission-keys';

export interface RequiredPermissions {
  required: PermissionKeys[];
}
export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  permissions: String[];
}
