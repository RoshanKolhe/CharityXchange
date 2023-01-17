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
  UserProfile,
} from '../models';
import {UserRepository} from '../repositories';

export class UserUserProfileController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @get('/users/{id}/user-profile', {
    responses: {
      '200': {
        description: 'User has one UserProfile',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserProfile),
          },
        },
      },
    },
  })
  async get(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<UserProfile>,
  ): Promise<UserProfile> {
    return this.userRepository.userProfile(id).get(filter);
  }

  @post('/users/{id}/user-profile', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(UserProfile)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserProfile, {
            title: 'NewUserProfileInUser',
            exclude: ['id'],
            optional: ['userId']
          }),
        },
      },
    }) userProfile: Omit<UserProfile, 'id'>,
  ): Promise<UserProfile> {
    return this.userRepository.userProfile(id).create(userProfile);
  }

  @patch('/users/{id}/user-profile', {
    responses: {
      '200': {
        description: 'User.UserProfile PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserProfile, {partial: true}),
        },
      },
    })
    userProfile: Partial<UserProfile>,
    @param.query.object('where', getWhereSchemaFor(UserProfile)) where?: Where<UserProfile>,
  ): Promise<Count> {
    return this.userRepository.userProfile(id).patch(userProfile, where);
  }

  @del('/users/{id}/user-profile', {
    responses: {
      '200': {
        description: 'User.UserProfile DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(UserProfile)) where?: Where<UserProfile>,
  ): Promise<Count> {
    return this.userRepository.userProfile(id).delete(where);
  }
}
