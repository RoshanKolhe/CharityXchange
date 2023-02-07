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
  UserLinks,
} from '../models';
import {UserRepository} from '../repositories';

export class UserUserLinksController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @get('/users/{id}/user-links', {
    responses: {
      '200': {
        description: 'Array of User has many UserLinks',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(UserLinks)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<UserLinks>,
  ): Promise<UserLinks[]> {
    return this.userRepository.userLinks(id).find(filter);
  }

  @post('/users/{id}/user-links', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(UserLinks)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserLinks, {
            title: 'NewUserLinksInUser',
            exclude: ['id'],
            optional: ['userId']
          }),
        },
      },
    }) userLinks: Omit<UserLinks, 'id'>,
  ): Promise<UserLinks> {
    return this.userRepository.userLinks(id).create(userLinks);
  }

  @patch('/users/{id}/user-links', {
    responses: {
      '200': {
        description: 'User.UserLinks PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserLinks, {partial: true}),
        },
      },
    })
    userLinks: Partial<UserLinks>,
    @param.query.object('where', getWhereSchemaFor(UserLinks)) where?: Where<UserLinks>,
  ): Promise<Count> {
    return this.userRepository.userLinks(id).patch(userLinks, where);
  }

  @del('/users/{id}/user-links', {
    responses: {
      '200': {
        description: 'User.UserLinks DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(UserLinks)) where?: Where<UserLinks>,
  ): Promise<Count> {
    return this.userRepository.userLinks(id).delete(where);
  }
}
