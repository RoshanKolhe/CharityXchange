import {inject, Constructor} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {CharityxchangeSqlDataSource} from '../datasources';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {AdminReceivedLinks, AdminReceivedLinksRelations} from '../models';
export class AdminReceivedLinksRepository extends TimeStampRepositoryMixin<
  AdminReceivedLinks,
  typeof AdminReceivedLinks.prototype.id,
  Constructor<
    DefaultCrudRepository<
      AdminReceivedLinks,
      typeof AdminReceivedLinks.prototype.id,
      AdminReceivedLinksRelations
    >
  >
>(DefaultCrudRepository) {
  constructor(
    @inject('datasources.charityxchangeSql')
    dataSource: CharityxchangeSqlDataSource,
  ) {
    super(AdminReceivedLinks, dataSource);
  }
}
