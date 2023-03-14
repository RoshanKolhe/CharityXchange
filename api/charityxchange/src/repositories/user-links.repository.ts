import {inject, Constructor, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  HasOneRepositoryFactory, HasManyRepositoryFactory, BelongsToAccessor} from '@loopback/repository';
import {CharityxchangeSqlDataSource} from '../datasources';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {UserLinks, UserLinksRelations, AdminReceivedLinks, User} from '../models';
import {AdminReceivedLinksRepository} from './admin-received-links.repository';
import {UserRepository} from './user.repository';

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

  public readonly user: BelongsToAccessor<User, typeof UserLinks.prototype.id>;

  constructor(
    @inject('datasources.charityxchangeSql')
    dataSource: CharityxchangeSqlDataSource, 
    @repository.getter('AdminReceivedLinksRepository') 
    protected adminReceivedLinksRepositoryGetter: Getter<AdminReceivedLinksRepository>, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(UserLinks, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
    this.adminReceivedLinks = this.createHasManyRepositoryFactoryFor('adminReceivedLinks', adminReceivedLinksRepositoryGetter,);
    this.registerInclusionResolver('adminReceivedLinks', this.adminReceivedLinks.inclusionResolver);
  }
}
