import {Entity, model, property, belongsTo} from '@loopback/repository';
import {User} from './user.model';

@model()
export class TokenRequests extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    required: true,
  })
  amount?: number;

  @property({
    type: 'string',
    required: true,
  })
  transaction_id: string;

  @property({
    type: 'number',
    default: 0,
  })
  status: number;

  @property({
    type: 'object',
    required: true,
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

  @belongsTo(() => User)
  userId: number;

  constructor(data?: Partial<TokenRequests>) {
    super(data);
  }
}

export interface TokenRequestsRelations {
  // describe navigational properties here
}

export type TokenRequestsWithRelations = TokenRequests & TokenRequestsRelations;
