import {inject, Constructor} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {CharityxchangeSqlDataSource} from '../datasources';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {TokenRequests, TokenRequestsRelations} from '../models';
export class TokenRequestsRepository extends TimeStampRepositoryMixin<
  TokenRequests,
  typeof TokenRequests.prototype.id,
  Constructor<
    DefaultCrudRepository<
      TokenRequests,
      typeof TokenRequests.prototype.id,
      TokenRequestsRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.charityxchangeSql')
    dataSource: CharityxchangeSqlDataSource,
  ) {
    super(TokenRequests, dataSource);
  }
}
