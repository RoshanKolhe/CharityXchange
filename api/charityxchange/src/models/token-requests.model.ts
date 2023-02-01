import {Entity, model, property} from '@loopback/repository';

@model()
export class TokenRequests extends Entity {
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
  transaction_id: string;

  @property({
    type: 'object',
  })
  payment_screen_shot?: object;

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

  constructor(data?: Partial<TokenRequests>) {
    super(data);
  }
}

export interface TokenRequestsRelations {
  // describe navigational properties here
}

export type TokenRequestsWithRelations = TokenRequests & TokenRequestsRelations;
