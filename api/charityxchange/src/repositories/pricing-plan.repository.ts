import {inject,Constructor} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {CharityxchangeSqlDataSource} from '../datasources';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';
import {PricingPlan, PricingPlanRelations} from '../models';
export class PricingPlanRepository extends TimeStampRepositoryMixin<
PricingPlan,
  typeof PricingPlan.prototype.id,
  Constructor<
    DefaultCrudRepository<
    PricingPlan,
      typeof PricingPlan.prototype.id,
      PricingPlanRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.charityxchangeSql') dataSource: CharityxchangeSqlDataSource,
  ) {
    super(PricingPlan, dataSource);
  }
}
