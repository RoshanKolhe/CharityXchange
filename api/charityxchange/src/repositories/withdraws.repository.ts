import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {CharityxchangeSqlDataSource} from '../datasources';
import {Withdraws, WithdrawsRelations} from '../models';

export class WithdrawsRepository extends DefaultCrudRepository<
  Withdraws,
  typeof Withdraws.prototype.id,
  WithdrawsRelations
> {
  constructor(
    @inject('datasources.charityxchangeSql') dataSource: CharityxchangeSqlDataSource,
  ) {
    super(Withdraws, dataSource);
  }
}
