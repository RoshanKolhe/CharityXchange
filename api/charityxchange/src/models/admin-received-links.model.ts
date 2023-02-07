import {Entity, model, property} from '@loopback/repository';

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
  userLinksId?: number;

  constructor(data?: Partial<AdminReceivedLinks>) {
    super(data);
  }
}

export interface AdminReceivedLinksRelations {
  // describe navigational properties here
}

export type AdminReceivedLinksWithRelations = AdminReceivedLinks & AdminReceivedLinksRelations;
