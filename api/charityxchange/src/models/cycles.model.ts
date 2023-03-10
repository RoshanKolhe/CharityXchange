import {Entity, model, property, hasMany} from '@loopback/repository';
import {CyclePayments} from './cycle-payments.model';

@model()
export class Cycles extends Entity {
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
  startDate: string;

  @property({
    type: 'string',
    required: true,
  })
  endDate: string;

  @property({
    type: 'boolean',
    required: true,
  })
  is_active: boolean;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @hasMany(() => CyclePayments)
  cyclePayments: CyclePayments[];

  constructor(data?: Partial<Cycles>) {
    super(data);
  }
}

export interface CyclesRelations {
  // describe navigational properties here
}

export type CyclesWithRelations = Cycles & CyclesRelations;
