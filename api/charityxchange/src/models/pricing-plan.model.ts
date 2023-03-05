import {Entity, model, property} from '@loopback/repository';

@model()
export class PricingPlan extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  title?: string;

  @property({
    type: 'number',
    required: true,
    default: 0.0,
    dataType: 'decimal',
    precision: 30,
    scale: 2,
  })
  price: number;

  @property({
    type: 'number',
    required: true,
    default: 0.0,
    dataType: 'decimal',
    precision: 30,
    scale: 2,
  })
  discounted_price: number;

  @property({
    type: 'number',
    required: true,
  })
  total_links: number;

  @property({
    type: 'object',
    required: true,
  })
  features: object;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  constructor(data?: Partial<PricingPlan>) {
    super(data);
  }
}

export interface PricingPlanRelations {
  // describe navigational properties here
}

export type PricingPlanWithRelations = PricingPlan & PricingPlanRelations;
