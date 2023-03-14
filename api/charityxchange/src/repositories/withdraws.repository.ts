import {inject, Constructor, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {CharityxchangeSqlDataSource} from '../datasources';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {Withdraws, WithdrawsRelations, User} from '../models';
import {UserRepository} from './user.repository';

export class WithdrawsRepository extends TimeStampRepositoryMixin<
  Withdraws,
  typeof Withdraws.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Withdraws,
      typeof Withdraws.prototype.id,
      WithdrawsRelations
    >
  >
>(DefaultCrudRepository) {

  public readonly user: BelongsToAccessor<User, typeof Withdraws.prototype.id>;

  constructor(
    @inject('datasources.charityxchangeSql')
    dataSource: CharityxchangeSqlDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Withdraws, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
