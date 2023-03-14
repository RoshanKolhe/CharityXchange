import {inject, Constructor, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {CharityxchangeSqlDataSource} from '../datasources';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {AdminReceivedLinks, AdminReceivedLinksRelations, UserLinks} from '../models';
import {UserLinksRepository} from './user-links.repository';

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

  public readonly userLinks: BelongsToAccessor<UserLinks, typeof AdminReceivedLinks.prototype.id>;

  constructor(
    @inject('datasources.charityxchangeSql')
    dataSource: CharityxchangeSqlDataSource, @repository.getter('UserLinksRepository') protected userLinksRepositoryGetter: Getter<UserLinksRepository>,
  ) {
    super(AdminReceivedLinks, dataSource);
    this.userLinks = this.createBelongsToAccessorFor('userLinks', userLinksRepositoryGetter,);
    this.registerInclusionResolver('userLinks', this.userLinks.inclusionResolver);
  }
}
