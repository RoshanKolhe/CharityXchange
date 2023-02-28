import {inject, Constructor, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {CharityxchangeSqlDataSource} from '../datasources';
import {TimeStampRepositoryMixin} from '../mixins/timestamp-repository-mixin';
import {Cycles, CyclesRelations, CyclePayments} from '../models';
import {CyclePaymentsRepository} from './cycle-payments.repository';

export class CyclesRepository extends TimeStampRepositoryMixin<
  Cycles,
  typeof Cycles.prototype.id,
  Constructor<
    DefaultCrudRepository<Cycles, typeof Cycles.prototype.id, CyclesRelations>
  >
>(DefaultCrudRepository) {

  public readonly cyclePayments: HasManyRepositoryFactory<CyclePayments, typeof Cycles.prototype.id>;

  constructor(
    @inject('datasources.charityxchangeSql')
    dataSource: CharityxchangeSqlDataSource, @repository.getter('CyclePaymentsRepository') protected cyclePaymentsRepositoryGetter: Getter<CyclePaymentsRepository>,
  ) {
    super(Cycles, dataSource);
    this.cyclePayments = this.createHasManyRepositoryFactoryFor('cyclePayments', cyclePaymentsRepositoryGetter,);
    this.registerInclusionResolver('cyclePayments', this.cyclePayments.inclusionResolver);
  }
}
