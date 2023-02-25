import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  DefaultTransactionalRepository,
  Filter,
  FilterBuilder,
  FilterExcludingWhere,
  IsolationLevel,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {filter} from 'lodash';
import {PermissionKeys} from '../authorization/permission-keys';
import {CharityxchangeSqlDataSource} from '../datasources';
import {Cycles} from '../models';
import {
  AdminReceivedLinksRepository,
  CyclesRepository,
  UserLinksRepository,
  UserRepository,
} from '../repositories';
import {CyclesService} from '../services/cycles.service';
import {MyUserService} from '../services/user-service';
import {LEVEL_PRICES, PER_LINK_HELP_AMOUNT} from '../utils/constants';

export class CycleController {
  constructor(
    @repository(CyclesRepository)
    public cyclesRepository: CyclesRepository,
    @repository(AdminReceivedLinksRepository)
    protected adminReceivedLinksRepository: AdminReceivedLinksRepository,
    @inject('datasources.charityxchangeSql')
    public dataSource: CharityxchangeSqlDataSource,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @repository(UserLinksRepository)
    protected userLinksRepository: UserLinksRepository,
    @inject('service.cycle.service')
    public cycleService: CyclesService,
    @inject('service.user.service')
    public userService: MyUserService,
  ) {}

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @post('/cycles')
  @response(200, {
    description: 'Cycles model instance',
    content: {'application/json': {schema: getModelSchemaRef(Cycles)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Cycles, {
            title: 'NewCycles',
            exclude: ['id'],
          }),
        },
      },
    })
    cycles: Omit<Cycles, 'id'>,
  ): Promise<Cycles> {
    return this.cyclesRepository.create(cycles);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @get('/cycles/count')
  @response(200, {
    description: 'Cycles model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Cycles) where?: Where<Cycles>): Promise<Count> {
    return this.cyclesRepository.count(where);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @get('/cycles')
  @response(200, {
    description: 'Array of Cycles model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Cycles, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Cycles) filter?: Filter<Cycles>): Promise<Cycles[]> {
    return this.cyclesRepository.find(filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @patch('/cycles')
  @response(200, {
    description: 'Cycles PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Cycles, {partial: true}),
        },
      },
    })
    cycles: Cycles,
    @param.where(Cycles) where?: Where<Cycles>,
  ): Promise<Count> {
    return this.cyclesRepository.updateAll(cycles, where);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @get('/cycles/{id}')
  @response(200, {
    description: 'Cycles model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Cycles, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Cycles, {exclude: 'where'})
    filter?: FilterExcludingWhere<Cycles>,
  ): Promise<Cycles> {
    return this.cyclesRepository.findById(id, filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @patch('/cycles/{id}')
  @response(204, {
    description: 'Cycles PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Cycles, {partial: true}),
        },
      },
    })
    cycles: Cycles,
  ): Promise<void> {
    await this.cyclesRepository.updateById(id, cycles);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @put('/cycles/{id}')
  @response(204, {
    description: 'Cycles PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() cycles: Cycles,
  ): Promise<void> {
    await this.cyclesRepository.replaceById(id, cycles);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @del('/cycles/{id}')
  @response(204, {
    description: 'Cycles DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.cyclesRepository.deleteById(id);
  }

  @post('/cycles/endCycle')
  async endPayoutCycle(@requestBody() cycles: any): Promise<any> {
    const repo = new DefaultTransactionalRepository(Cycles, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    try {
      let participatedUserIds: any = [];

      const allUserRecords = await this.userRepository.find();
      participatedUserIds = allUserRecords
        .filter(record => !record.permissions.includes('super_admin'))
        .map(x => x.id);
      const adminBalance = await this.userRepository.adminBalances(5).get();
      for (const element of participatedUserIds) {
        const userData = await this.userRepository.findOne({
          where: {
            id: element,
          },
          include: ['userProfile', 'balance_user', 'adminBalances'],
        });
        const userLevel = await this.userService.calculateUserLevel(userData);
        const createdAtDate = userData?.createdAt
          ? new Date(userData.createdAt)
          : new Date();
        const diffInMs = Date.now() - createdAtDate.getTime();
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        if (
          diffInDays <= 7 &&
          !userData?.balance_user &&
          !userData?.balance_user.is_first_level_price_taken
        ) {
          await this.userRepository.balance_user(element).patch({
            is_first_level_price_taken: true,
            current_balance: userData?.balance_user.current_balance || 0 + 20,
            total_earnings: userData?.balance_user.total_earnings || 0 + 20,
          });

          await this.userRepository.adminBalances(5).patch({
            activation_help: adminBalance.activation_help - 20,
          });
        }
        if (userLevel.level) {
          const price =
            LEVEL_PRICES[userLevel.level as keyof typeof LEVEL_PRICES];
          await this.userRepository.balance_user(element).patch({
            total_earnings:
              userData?.balance_user.total_earnings ||
              0 + price.levelIncome + price.awardOrReward,
            current_balance:
              userData?.balance_user.current_balance ||
              0 + price.levelIncome + price.awardOrReward,
          });
        }
      }
      this.cycleService.updateCycleAndSendEmailToUser(participatedUserIds);

      tx.commit();
      return Promise.resolve({
        success: true,
        message: `Successfully Closed the Cycle`,
      });
    } catch (err) {
      tx.rollback();
      return Promise.resolve({
        success: false,
        message: err,
      });
    }
  }
}
