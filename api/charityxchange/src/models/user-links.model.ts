import {Entity, model, property, hasOne, hasMany} from '@loopback/repository';
import {AdminReceivedLinks} from './admin-received-links.model';

@model()
export class UserLinks extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  linkName: string;

  @property({
    type: 'boolean',
    required: true,
  })
  is_active: boolean;

  @property({
    type: 'string',
  })
  activationStartTime?: string | null;

  @property({
    type: 'string',
  })
  activationEndTime?: string | null;

  @property({
    type: 'boolean',
    required: true,
  })
  is_help_send: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  is_help_received: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  is_send_to_admin: boolean;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @property({
    type: 'number',
  })
  userId?: number;

  @hasMany(() => AdminReceivedLinks)
  adminReceivedLinks: AdminReceivedLinks[];

  constructor(data?: Partial<UserLinks>) {
    super(data);
  }
}

export interface UserLinksRelations {
  // describe navigational properties here
}

export type UserLinksWithRelations = UserLinks & UserLinksRelations;
