import {inject,Constructor} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {CharityxchangeSqlDataSource} from '../datasources';
import { TimeStampRepositoryMixin } from '../mixins/timestamp-repository-mixin';
import {CyclePayments, CyclePaymentsRelations} from '../models';
export class CyclePaymentsRepository extends TimeStampRepositoryMixin<
CyclePayments,
  typeof CyclePayments.prototype.id,
  Constructor<
    DefaultCrudRepository<
    CyclePayments,
      typeof CyclePayments.prototype.id,
      CyclePaymentsRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.charityxchangeSql') dataSource: CharityxchangeSqlDataSource,
  ) {
    super(CyclePayments, dataSource);
  }
}
