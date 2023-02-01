import {inject, Constructor, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasOneRepositoryFactory, HasManyRepositoryFactory} from '@loopback/repository';
import {CharityxchangeSqlDataSource} from '../datasources';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {User, UserRelations, UserProfile, Balances, AdminBalances, TokenRequests} from '../models';
import {UserProfileRepository} from './user-profile.repository';
import {BalancesRepository} from './balances.repository';
import {AdminBalancesRepository} from './admin-balances.repository';
import {TokenRequestsRepository} from './token-requests.repository';

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

  public readonly adminBalances: HasOneRepositoryFactory<AdminBalances, typeof User.prototype.id>;

  public readonly tokenRequests: HasManyRepositoryFactory<TokenRequests, typeof User.prototype.id>;

  constructor(
    @inject('datasources.charityxchangeSql')
    dataSource: CharityxchangeSqlDataSource, @repository.getter('UserProfileRepository') protected userProfileRepositoryGetter: Getter<UserProfileRepository>, @repository.getter('BalancesRepository') protected balancesRepositoryGetter: Getter<BalancesRepository>, @repository.getter('AdminBalancesRepository') protected adminBalancesRepositoryGetter: Getter<AdminBalancesRepository>, @repository.getter('TokenRequestsRepository') protected tokenRequestsRepositoryGetter: Getter<TokenRequestsRepository>,
  ) {
    super(User, dataSource);
    this.tokenRequests = this.createHasManyRepositoryFactoryFor('tokenRequests', tokenRequestsRepositoryGetter,);
    this.registerInclusionResolver('tokenRequests', this.tokenRequests.inclusionResolver);
    this.adminBalances = this.createHasOneRepositoryFactoryFor('adminBalances', adminBalancesRepositoryGetter);
    this.registerInclusionResolver('adminBalances', this.adminBalances.inclusionResolver);
    this.balance_user = this.createHasOneRepositoryFactoryFor('balance_user', balancesRepositoryGetter);
    this.registerInclusionResolver('balance_user', this.balance_user.inclusionResolver);
    this.userProfile = this.createHasOneRepositoryFactoryFor('userProfile', userProfileRepositoryGetter);
    this.registerInclusionResolver('userProfile', this.userProfile.inclusionResolver);
  }
}
