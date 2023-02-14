import {Entity, model, property} from '@loopback/repository';

@model()
export class AdminBalances extends Entity {
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
  total_earnings: number;

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
    type: 'number',
    default: 0,
  })
  total_help_send: number;

  @property({
    type: 'number',
    default: 0,
  })
  activation_help: number;

  @property({
    type: 'number',
    default: 0,
  })
  total_help_received: number;


  @property({
    type: 'object',
  })
  payment_info: object;

  @property({
    type: 'number',
    default: 0,
  })
  total_supply: number;

  @property({
    type: 'number',
  })
  adminId: number;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  constructor(data?: Partial<AdminBalances>) {
    super(data);
  }
}

export interface AdminBalancesRelations {
  // describe navigational properties here
}

export type AdminBalancesWithRelations = AdminBalances & AdminBalancesRelations;
