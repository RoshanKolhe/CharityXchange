import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  DefaultTransactionalRepository,
  Filter,
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
import {PER_LINK_HELP_AMOUNT} from '../utils/constants';

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
    try {
      const allLinksBetweenDates = await this.adminReceivedLinksRepository.find(
        {
          where: {
            createdAt: {
              between: [cycles.startDate, cycles.endDate],
            },
          },
        },
      );
      if (allLinksBetweenDates.length > 0) {
        this.cycleService.sendNonWorkingMoneyToUser(allLinksBetweenDates);
        let participatedUserIds: any = [];
        for (const res of allLinksBetweenDates) {
          const userLinkData = await this.userLinksRepository.findById(
            res.userLinksId,
          );
          participatedUserIds.push(userLinkData.userId);
        }
        const filteredParicipatedUsers = participatedUserIds.filter(
          (item: any, index: any) =>
            participatedUserIds.indexOf(item) === index,
        );
        console.log(
          'filteredParicipatedUsers',
          filteredParicipatedUsers.length,
        );

        this.cycleService.updateCycleAndSendEmailToUser(
          filteredParicipatedUsers,
        );
        return Promise.resolve({
          success: true,
          message: `Successfully Closed the Cycle`,
        });
      } else {
        throw new HttpErrors.NotFound('No Links Found For this cycle');
      }
    } catch (err) {
      return Promise.resolve({
        success: false,
        message: err,
      });
    }
  }
}
