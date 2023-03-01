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
import {filter, first} from 'lodash';
import {PermissionKeys} from '../authorization/permission-keys';
import {CharityxchangeSqlDataSource} from '../datasources';
import {CyclePayments, Cycles} from '../models';
import {
  AdminReceivedLinksRepository,
  CyclesRepository,
  UserLinksRepository,
  UserRepository,
} from '../repositories';
import {CyclesService} from '../services/cycles.service';
import {MyUserService} from '../services/user-service';
import {
  ADMIN_ID,
  FIRST_LEVEL_AWARD,
  LEVEL_PRICES,
  PER_LINK_HELP_AMOUNT,
} from '../utils/constants';

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
  async endPayoutCycle(@requestBody() cycles: Cycles): Promise<any> {
    let participatedUserIds: any = [];

    const allUserRecords = await this.userRepository.find({
      where: {
        is_active: true,
      },
    });
    participatedUserIds = allUserRecords
      .filter(record => !record.permissions.includes('super_admin'))
      .map(x => x.id);

    let totalAwardOrReward = 0;
    let totalLevelIncome = 0;
    for (const id of participatedUserIds) {
      let awardOrReward = 0;
      let levelIncome = 0;
      let isFirstLevel = false;
      const userData = await this.userRepository.findOne({
        where: {
          id: id,
        },
      });
      if (userData) {
        const userBalance = await this.userRepository
          .balance_user(userData.id)
          .get();
        const adminBalance = await this.userRepository
          .adminBalances(ADMIN_ID)
          .get();
        console.log(adminBalance);
        const userLevel = await this.userService.calculateUserLevel(userData);
        const createdAtDate = userData.createdAt
          ? new Date(userData.createdAt)
          : new Date();
        const diffInMs = Date.now() - createdAtDate.getTime();
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        if (
          diffInDays <= 7 &&
          userLevel.level === 'LEVEL_1' &&
          !userBalance.is_first_level_price_taken
        ) {
          isFirstLevel = true;
          awardOrReward = awardOrReward + FIRST_LEVEL_AWARD;
          totalAwardOrReward = totalAwardOrReward + FIRST_LEVEL_AWARD;
        }
        if (userLevel.level !== null) {
          const price =
            LEVEL_PRICES[userLevel.level as keyof typeof LEVEL_PRICES];
          if (userLevel.level === 'LEVEL_1') {
            levelIncome = levelIncome + price.levelIncome;
            totalLevelIncome = totalLevelIncome + price.levelIncome;
          } else {
            awardOrReward = awardOrReward + price.awardOrReward;
            levelIncome = levelIncome + price.levelIncome;
            totalLevelIncome = totalLevelIncome + price.levelIncome;
            totalAwardOrReward = totalAwardOrReward + price.awardOrReward;
          }
        }
        await this.userRepository.balance_user(id).patch({
          total_earnings:
            userBalance.total_earnings + awardOrReward + levelIncome,
          current_balance:
            userBalance.current_balance + awardOrReward + levelIncome,
          is_first_level_price_taken: isFirstLevel ? true : false,
        });
        const total = awardOrReward + levelIncome;
        const inputData = {
          total_earnings: adminBalance.total_earnings - total,
          total_supply: adminBalance.total_supply - total,
          activation_help: adminBalance.activation_help - total,
        };
        await this.userRepository.adminBalances(ADMIN_ID).patch(inputData);
        await this.userRepository.updateById(id, {
          cycles_participated: userData.cycles_participated + 1,
        });
      }
    }
    const cyclePaymentsInputData = {
      levelIncome: totalLevelIncome,
      awardOrReward: totalAwardOrReward,
      participatedUsers: participatedUserIds.length,
    };
    await this.cyclesRepository
      .cyclePayments(cycles.id)
      .create(cyclePaymentsInputData);
    await this.cyclesRepository.updateById(cycles.id, {
      is_active: false,
    });
    this.cycleService.sendCongratulationEmailToAllParticipatedUser(
      allUserRecords,
    );
    return Promise.resolve({
      success: true,
      message: `Successfully Closed the Cycle`,
    });
  }

  @authenticate('jwt')
  @post('/cycles/getCycleData')
  async getPayoutData(@requestBody() cycle: Cycles): Promise<any> {
    try {
      let participatedUserIds: any = [];

      const allUserRecords = await this.userRepository.find({
        where: {
          is_active: true,
        },
      });
      participatedUserIds = allUserRecords
        .filter(record => !record.permissions.includes('super_admin'))
        .map(x => x.id);
      let awardOrReward = 0;
      let levelIncome = 0;
      for (const element of participatedUserIds) {
        const userData = await this.userRepository.findOne({
          where: {
            id: element,
          },
          include: ['userProfile', 'balance_user', 'adminBalances'],
        });
        const userLevel = await this.userService.calculateUserLevel(
          userData,
          cycle,
        );

        const createdAtDate = userData?.createdAt
          ? new Date(userData.createdAt)
          : new Date();
        const diffInMs = Date.now() - createdAtDate.getTime();
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
        if (
          diffInDays <= 7 &&
          userLevel.level == 'LEVEL_1' &&
          userData &&
          userData.balance_user &&
          !userData.balance_user.is_first_level_price_taken
        ) {
          awardOrReward = awardOrReward + FIRST_LEVEL_AWARD;
        }
        if (userLevel.level) {
          const price =
            LEVEL_PRICES[userLevel.level as keyof typeof LEVEL_PRICES];
          if (userLevel.level != 'LEVEL_1') {
            levelIncome = levelIncome + price.levelIncome;
            awardOrReward = awardOrReward + price.awardOrReward;
          } else {
            levelIncome = levelIncome + price.levelIncome;
          }
        }
      }
      return Promise.resolve({
        levelIncome: levelIncome,
        awardOrReward: awardOrReward,
        participatedUsers: participatedUserIds.length,
      });
    } catch (err) {
      throw new HttpErrors[400](err);
    }
  }
}
