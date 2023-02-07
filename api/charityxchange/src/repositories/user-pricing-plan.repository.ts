import {inject, Constructor} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {CharityxchangeSqlDataSource} from '../datasources';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {UserPricingPlan, UserPricingPlanRelations} from '../models';

export class UserPricingPlanRepository extends TimeStampRepositoryMixin<
  UserPricingPlan,
  typeof UserPricingPlan.prototype.id,
  Constructor<
    DefaultCrudRepository<
      UserPricingPlan,
      typeof UserPricingPlan.prototype.id,
      UserPricingPlanRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.charityxchangeSql')
    dataSource: CharityxchangeSqlDataSource,
  ) {
    super(UserPricingPlan, dataSource);
  }
}
