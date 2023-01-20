import {inject, Constructor, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasOneRepositoryFactory} from '@loopback/repository';
import {CharityxchangeSqlDataSource} from '../datasources';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {User, UserRelations, UserProfile, Balances} from '../models';
import {UserProfileRepository} from './user-profile.repository';
import {BalancesRepository} from './balances.repository';

export type Credentials = {
  email: string;
  password: string;
}

export class UserRepository extends TimeStampRepositoryMixin<
  User,
  typeof User.prototype.id,
  Constructor<
    DefaultCrudRepository<User, typeof User.prototype.id, UserRelations>
  >
>(DefaultCrudRepository) {

  public readonly userProfile: HasOneRepositoryFactory<UserProfile, typeof User.prototype.id>;

  public readonly balance_user: HasOneRepositoryFactory<Balances, typeof User.prototype.id>;

  constructor(
    @inject('datasources.charityxchangeSql')
    dataSource: CharityxchangeSqlDataSource, @repository.getter('UserProfileRepository') protected userProfileRepositoryGetter: Getter<UserProfileRepository>, @repository.getter('BalancesRepository') protected balancesRepositoryGetter: Getter<BalancesRepository>,
  ) {
    super(User, dataSource);
    this.balance_user = this.createHasOneRepositoryFactoryFor('balance_user', balancesRepositoryGetter);
    this.registerInclusionResolver('balance_user', this.balance_user.inclusionResolver);
    this.userProfile = this.createHasOneRepositoryFactoryFor('userProfile', userProfileRepositoryGetter);
    this.registerInclusionResolver('userProfile', this.userProfile.inclusionResolver);
  }
}
