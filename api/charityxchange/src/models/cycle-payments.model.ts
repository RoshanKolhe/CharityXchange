import {Entity, model, property} from '@loopback/repository';

@model()
export class CyclePayments extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    required: true,
     dataType: 'FLOAT'
  })
  levelIncome: number;

  @property({
    type: 'number',
    required: true,
    dataType: 'FLOAT'
  })
  awardOrReward: number;

  @property({
    type: 'number',
    required: true,
    dataType: 'FLOAT'
  })
  participatedUsers: number;

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
  cyclesId?: number;

  constructor(data?: Partial<CyclePayments>) {
    super(data);
  }
}

export interface CyclePaymentsRelations {
  // describe navigational properties here
}

export type CyclePaymentsWithRelations = CyclePayments & CyclePaymentsRelations;
