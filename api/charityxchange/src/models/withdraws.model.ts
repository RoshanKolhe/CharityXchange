import {Entity, model, property} from '@loopback/repository';

@model()
export class Withdraws extends Entity {
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
  amount: number;

  @property({
    type: 'boolean',
    required: true,
    default: false,
  })
  status?: boolean;

  @property({
    type: 'string',
    required: true,
  })
  details: string;

  @property({
    type: 'string',
    required: true,
  })
  note?: string;

  @property({
    type: 'number',
  })
  userId?: number;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  constructor(data?: Partial<Withdraws>) {
    super(data);
  }
}

export interface WithdrawsRelations {
  // describe navigational properties here
}

export type WithdrawsWithRelations = Withdraws & WithdrawsRelations;
