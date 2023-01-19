import {PermissionKeys} from './authorization/permission-keys';
import {RequestHandler} from 'express-serve-static-core';

export type FileUploadHandler = RequestHandler;
export interface RequiredPermissions {
  required: PermissionKeys[];
}
export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  permissions: String[];
}
