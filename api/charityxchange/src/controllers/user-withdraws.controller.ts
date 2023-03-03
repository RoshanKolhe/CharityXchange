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
  Withdraws,
} from '../models';
import {UserRepository} from '../repositories';

export class UserWithdrawsController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @get('/users/{id}/withdraws', {
    responses: {
      '200': {
        description: 'Array of User has many Withdraws',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Withdraws)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Withdraws>,
  ): Promise<Withdraws[]> {
    return this.userRepository.withdraws(id).find(filter);
  }

  @post('/users/{id}/withdraws', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(Withdraws)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Withdraws, {
            title: 'NewWithdrawsInUser',
            exclude: ['id'],
            optional: ['userId']
          }),
        },
      },
    }) withdraws: Omit<Withdraws, 'id'>,
  ): Promise<Withdraws> {
    return this.userRepository.withdraws(id).create(withdraws);
  }

  @patch('/users/{id}/withdraws', {
    responses: {
      '200': {
        description: 'User.Withdraws PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Withdraws, {partial: true}),
        },
      },
    })
    withdraws: Partial<Withdraws>,
    @param.query.object('where', getWhereSchemaFor(Withdraws)) where?: Where<Withdraws>,
  ): Promise<Count> {
    return this.userRepository.withdraws(id).patch(withdraws, where);
  }

  @del('/users/{id}/withdraws', {
    responses: {
      '200': {
        description: 'User.Withdraws DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Withdraws)) where?: Where<Withdraws>,
  ): Promise<Count> {
    return this.userRepository.withdraws(id).delete(where);
  }
}
