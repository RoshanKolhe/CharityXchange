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
    type: 'string',
    required: true,
  })
  status: string;

  @property({
    type: 'object',
    required: true,
  })
  details: object;

  @property({
    type: 'string',
    required: true,
  })
  note: string;

  @property({
    type: 'number',
  })
  userId?: number;

  constructor(data?: Partial<Withdraws>) {
    super(data);
  }
}

export interface WithdrawsRelations {
  // describe navigational properties here
}

export type WithdrawsWithRelations = Withdraws & WithdrawsRelations;
