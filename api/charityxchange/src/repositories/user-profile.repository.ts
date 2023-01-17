import {inject, Getter, Constructor} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  BelongsToAccessor,
} from '@loopback/repository';
import {CharityxchangeSqlDataSource} from '../datasources';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {UserProfile, UserProfileRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class UserProfileRepository extends TimeStampRepositoryMixin<
  UserProfile,
  typeof UserProfile.prototype.id,
  Constructor<
    DefaultCrudRepository<
      UserProfile,
      typeof UserProfile.prototype.id,
      UserProfileRelations
    >
  >
>(DefaultCrudRepository) {
  public readonly user: BelongsToAccessor<
    User,
    typeof UserProfile.prototype.id
  >;

  constructor(
    @inject('datasources.charityxchangeSql')
    dataSource: CharityxchangeSqlDataSource,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(UserProfile, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
