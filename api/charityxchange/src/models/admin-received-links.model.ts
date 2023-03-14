import {Entity, model, property, belongsTo} from '@loopback/repository';
import {UserLinks} from './user-links.model';

@model()
export class AdminReceivedLinks extends Entity {
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
    type: 'boolean',
    required: true,
  })
  is_help_send: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  is_help_send_to_user: boolean;

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

  @belongsTo(() => UserLinks)
  userLinksId: number;

  constructor(data?: Partial<AdminReceivedLinks>) {
    super(data);
  }
}

export interface AdminReceivedLinksRelations {
  // describe navigational properties here
}

export type AdminReceivedLinksWithRelations = AdminReceivedLinks & AdminReceivedLinksRelations;
