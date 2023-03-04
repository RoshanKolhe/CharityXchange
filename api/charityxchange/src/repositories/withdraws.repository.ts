import {inject, Constructor} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {CharityxchangeSqlDataSource} from '../datasources';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {Withdraws, WithdrawsRelations} from '../models';
export class WithdrawsRepository extends TimeStampRepositoryMixin<
  Withdraws,
  typeof Withdraws.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Withdraws,
      typeof Withdraws.prototype.id,
      WithdrawsRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.charityxchangeSql')
    dataSource: CharityxchangeSqlDataSource,
  ) {
    super(Withdraws, dataSource);
  }
}
