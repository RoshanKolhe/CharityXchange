import {inject, Constructor} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {CharityxchangeSqlDataSource} from '../datasources';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {Cycles, CyclesRelations} from '../models';

export class CyclesRepository extends TimeStampRepositoryMixin<
  Cycles,
  typeof Cycles.prototype.id,
  Constructor<
    DefaultCrudRepository<Cycles, typeof Cycles.prototype.id, CyclesRelations>
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.charityxchangeSql')
    dataSource: CharityxchangeSqlDataSource,
  ) {
    super(Cycles, dataSource);
  }
}
