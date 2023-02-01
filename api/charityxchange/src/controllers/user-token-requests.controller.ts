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
  TokenRequests,
} from '../models';
import {UserRepository} from '../repositories';

export class UserTokenRequestsController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @get('/users/{id}/token-requests', {
    responses: {
      '200': {
        description: 'Array of User has many TokenRequests',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(TokenRequests)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<TokenRequests>,
  ): Promise<TokenRequests[]> {
    return this.userRepository.tokenRequests(id).find(filter);
  }

  @post('/users/{id}/token-requests', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(TokenRequests)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TokenRequests, {
            title: 'NewTokenRequestsInUser',
            exclude: ['id'],
            optional: ['userId']
          }),
        },
      },
    }) tokenRequests: Omit<TokenRequests, 'id'>,
  ): Promise<TokenRequests> {
    return this.userRepository.tokenRequests(id).create(tokenRequests);
  }

  @patch('/users/{id}/token-requests', {
    responses: {
      '200': {
        description: 'User.TokenRequests PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TokenRequests, {partial: true}),
        },
      },
    })
    tokenRequests: Partial<TokenRequests>,
    @param.query.object('where', getWhereSchemaFor(TokenRequests)) where?: Where<TokenRequests>,
  ): Promise<Count> {
    return this.userRepository.tokenRequests(id).patch(tokenRequests, where);
  }

  @del('/users/{id}/token-requests', {
    responses: {
      '200': {
        description: 'User.TokenRequests DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(TokenRequests)) where?: Where<TokenRequests>,
  ): Promise<Count> {
    return this.userRepository.tokenRequests(id).delete(where);
  }
}
