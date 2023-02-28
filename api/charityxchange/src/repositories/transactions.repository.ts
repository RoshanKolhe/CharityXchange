import {inject,Constructor} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {CharityxchangeSqlDataSource} from '../datasources';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';
import {Transactions, TransactionsRelations} from '../models';
export class TransactionsRepository extends TimeStampRepositoryMixin<
Transactions,
  typeof Transactions.prototype.id,
  Constructor<
    DefaultCrudRepository<
    Transactions,
      typeof Transactions.prototype.id,
      TransactionsRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.charityxchangeSql') dataSource: CharityxchangeSqlDataSource,
  ) {
    super(Transactions, dataSource);
  }
}
