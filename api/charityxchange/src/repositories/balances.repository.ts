import {inject, Constructor, Getter} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {CharityxchangeSqlDataSource} from '../datasources';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {Balances, BalancesRelations, User} from '../models';
import {UserRepository} from './user.repository';
export class BalancesRepository extends TimeStampRepositoryMixin<
  Balances,
  typeof Balances.prototype.id,
  Constructor<
    DefaultCrudRepository<
      Balances,
      typeof Balances.prototype.id,
      BalancesRelations
    >
  >
>(DefaultCrudRepository) {
  public readonly user: BelongsToAccessor<User, typeof Balances.prototype.id>;
  constructor(
    @inject('datasources.charityxchangeSql')
    dataSource: CharityxchangeSqlDataSource,
  ) {
    super(Balances, dataSource);
  }
}
