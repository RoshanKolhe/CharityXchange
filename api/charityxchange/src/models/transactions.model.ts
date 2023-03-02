import {Entity, model, property} from '@loopback/repository';

@model()
export class Transactions extends Entity {
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
    type: 'string',
    required: true,
  })
  type: string;

  @property({
    type: 'string',
    required: true,
  })
  remark: string;

  @property({
    type: 'number',
    required: true,
    mysql: {
      dataType: 'float',
      dataPrecision: 10,
      dataScale: 2,
    },
  })
  amount: number;

  @property({
    type: 'number',
    required: true,
    mysql: {
      dataType: 'float',
      dataPrecision: 10,
      dataScale: 2,
    },
  })
  transaction_fees: number;

  @property({
    type: 'boolean',
    required: true,
  })
  status: boolean;

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

  constructor(data?: Partial<Transactions>) {
    super(data);
  }
}

export interface TransactionsRelations {
  // describe navigational properties here
}

export type TransactionsWithRelations = Transactions & TransactionsRelations;
