import {belongsTo, Entity, model, property} from '@loopback/repository';
import {UserProfileWithRelations} from './user-profile.model';
import {User} from './user.model';

@model()
export class Balances extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    default: 0,
  })
  total_earnings?: number;

  @property({
    type: 'number',
    default: 0,
  })
  withdrawn_amount: number;

  @property({
    type: 'number',
    default: 0,
  })
  current_balance: number;

  @property({
    type: 'object',
  })
  payment_info: object;

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

  constructor(data?: Partial<Balances>) {
    super(data);
  }
}

export interface BalancesRelations {
  // describe navigational properties here
}

export type BalancesWithRelations = Balances & BalancesRelations;
