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
  Balances,
} from '../models';
import {UserRepository} from '../repositories';

export class UserBalancesController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @get('/users/{id}/balances', {
    responses: {
      '200': {
        description: 'User has one Balances',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Balances),
          },
        },
      },
    },
  })
  async get(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Balances>,
  ): Promise<Balances> {
    return this.userRepository.balance_user(id).get(filter);
  }

  @post('/users/{id}/balances', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(Balances)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Balances, {
            title: 'NewBalancesInUser',
            exclude: ['id'],
            optional: ['userId']
          }),
        },
      },
    }) balances: Omit<Balances, 'id'>,
  ): Promise<Balances> {
    return this.userRepository.balance_user(id).create(balances);
  }

  @patch('/users/{id}/balances', {
    responses: {
      '200': {
        description: 'User.Balances PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Balances, {partial: true}),
        },
      },
    })
    balances: Partial<Balances>,
    @param.query.object('where', getWhereSchemaFor(Balances)) where?: Where<Balances>,
  ): Promise<Count> {
    return this.userRepository.balance_user(id).patch(balances, where);
  }

  @del('/users/{id}/balances', {
    responses: {
      '200': {
        description: 'User.Balances DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Balances)) where?: Where<Balances>,
  ): Promise<Count> {
    return this.userRepository.balance_user(id).delete(where);
  }
}
