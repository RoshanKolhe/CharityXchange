import {inject, Constructor, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  HasOneRepositoryFactory, HasManyRepositoryFactory} from '@loopback/repository';
import {CharityxchangeSqlDataSource} from '../datasources';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {UserLinks, UserLinksRelations, AdminReceivedLinks} from '../models';
import {AdminReceivedLinksRepository} from './admin-received-links.repository';

export class UserLinksRepository extends TimeStampRepositoryMixin<
  UserLinks,
  typeof UserLinks.prototype.id,
  Constructor<
    DefaultCrudRepository<
      UserLinks,
      typeof UserLinks.prototype.id,
      UserLinksRelations
    >
  >
>(DefaultCrudRepository) {

  public readonly adminReceivedLinks: HasManyRepositoryFactory<AdminReceivedLinks, typeof UserLinks.prototype.id>;

  constructor(
    @inject('datasources.charityxchangeSql')
    dataSource: CharityxchangeSqlDataSource, @repository.getter('AdminReceivedLinksRepository') protected adminReceivedLinksRepositoryGetter: Getter<AdminReceivedLinksRepository>,
  ) {
    super(UserLinks, dataSource);
    this.adminReceivedLinks = this.createHasManyRepositoryFactoryFor('adminReceivedLinks', adminReceivedLinksRepositoryGetter,);
    this.registerInclusionResolver('adminReceivedLinks', this.adminReceivedLinks.inclusionResolver);
  }
}
