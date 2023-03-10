import {Entity, model, property, belongsTo} from '@loopback/repository';
import {User} from './user.model';

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
    default: 0.0,
    dataType: 'decimal',
    precision: 30,
    scale: 2,
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
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @belongsTo(() => User)
  userId: number;

  constructor(data?: Partial<Withdraws>) {
    super(data);
  }
}

export interface WithdrawsRelations {
  // describe navigational properties here
}

export type WithdrawsWithRelations = Withdraws & WithdrawsRelations;
