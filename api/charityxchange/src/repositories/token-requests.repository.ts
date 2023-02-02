import {inject, Constructor, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {CharityxchangeSqlDataSource} from '../datasources';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {TokenRequests, TokenRequestsRelations, User} from '../models';
import {UserRepository} from './user.repository';

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

  public readonly user: BelongsToAccessor<User, typeof TokenRequests.prototype.id>;

  constructor(
    @inject('datasources.charityxchangeSql')
    dataSource: CharityxchangeSqlDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(TokenRequests, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
