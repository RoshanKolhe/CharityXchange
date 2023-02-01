import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  User,
  AdminBalances,
} from '../models';
import {UserRepository} from '../repositories';

export class UserAdminBalancesController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @get('/users/{id}/admin-balances', {
    responses: {
      '200': {
        description: 'User has one AdminBalances',
        content: {
          'application/json': {
            schema: getModelSchemaRef(AdminBalances),
          },
        },
      },
    },
  })
  async get(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<AdminBalances>,
  ): Promise<AdminBalances> {
    return this.userRepository.adminBalances(id).get(filter);
  }

  @post('/users/{id}/admin-balances', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(AdminBalances)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AdminBalances, {
            title: 'NewAdminBalancesInUser',
            exclude: ['id'],
            optional: ['adminId']
          }),
        },
      },
    }) adminBalances: Omit<AdminBalances, 'id'>,
  ): Promise<AdminBalances> {
    return this.userRepository.adminBalances(id).create(adminBalances);
  }

  @patch('/users/{id}/admin-balances', {
    responses: {
      '200': {
        description: 'User.AdminBalances PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AdminBalances, {partial: true}),
        },
      },
    })
    adminBalances: Partial<AdminBalances>,
    @param.query.object('where', getWhereSchemaFor(AdminBalances)) where?: Where<AdminBalances>,
  ): Promise<Count> {
    return this.userRepository.adminBalances(id).patch(adminBalances, where);
  }

  @del('/users/{id}/admin-balances', {
    responses: {
      '200': {
        description: 'User.AdminBalances DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(AdminBalances)) where?: Where<AdminBalances>,
  ): Promise<Count> {
    return this.userRepository.adminBalances(id).delete(where);
  }
}
