import {Entity, model, property} from '@loopback/repository';

@model()
export class UserPricingPlan extends Entity {
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
  userId: number;

  @property({
    type: 'number',
    required: true,
  })
  pricingPlanId: number;

  @property({
    type: 'string',
  })
  startDate: string;

  @property({
    type: 'string',
  })
  endDate: string;

  @property({
    type: 'boolean',
    required: true,
    default: 0,
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

  constructor(data?: Partial<UserPricingPlan>) {
    super(data);
  }
}

export interface UserPricingPlanRelations {
  // describe navigational properties here
}

export type UserPricingPlanWithRelations = UserPricingPlan &
  UserPricingPlanRelations;
