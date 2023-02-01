import {inject, Constructor} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {CharityxchangeSqlDataSource} from '../datasources';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {AdminBalances, AdminBalancesRelations} from '../models';
export class AdminBalancesRepository extends TimeStampRepositoryMixin<
  AdminBalances,
  typeof AdminBalances.prototype.id,
  Constructor<
    DefaultCrudRepository<
      AdminBalances,
      typeof AdminBalances.prototype.id,
      AdminBalancesRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.charityxchangeSql')
    dataSource: CharityxchangeSqlDataSource,
  ) {
    super(AdminBalances, dataSource);
  }
}
