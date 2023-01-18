import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
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
  HttpErrors,
  param,
  patch,
  post,
  requestBody,
  RequestContext,
  RestBindings,
} from '@loopback/rest';
import {omit, pick} from 'lodash';
import {User, UserProfile} from '../models';
import {UserRepository} from '../repositories';

export class UserUserProfileController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) {}

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
  @authenticate('jwt')
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
  @authenticate('jwt')
  async create(
    @param.path.number('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserProfile, {
            title: 'NewUserProfileInUser',
            exclude: ['id'],
            optional: ['userId'],
          }),
        },
      },
    })
    userProfile: Omit<UserProfile, 'id'>,
  ): Promise<UserProfile> {
    return this.userRepository.userProfile(id).create(userProfile);
  }

  @patch('/users/{id}/user-profile')
  @authenticate('jwt')
  async patch(
    @param.path.number('id') id: number,
    @requestBody({})
    userProfile: any,
  ): Promise<{}> {
    try {
      const userProfilePoccessabelData = userProfile;
      await this.userRepository.updateById(
        id,
        omit(userProfile, 'userProfile'),
      );

      if (userProfilePoccessabelData.userProfile.hasOwnProperty('id')) {
        console.log('here');
        await this.userRepository
          .userProfile(id)
          .patch(userProfilePoccessabelData.userProfile);
      } else {
        const data = await this.userRepository.userProfile(id).get().catch((res)=>{
          console.log(res);
        });

        if (!data) {
          console.log('here2');
          await this.userRepository
            .userProfile(id)
            .create(userProfilePoccessabelData.userProfile);
        } else {
          console.log('here1');
          await this.userRepository
            .userProfile(id)
            .patch(userProfilePoccessabelData.userProfile);
        }
      }
      return Promise.resolve({
        ...userProfile,
      });
    } catch (err) {
      throw new HttpErrors.UnprocessableEntity(`error updatin profile${err}`);
    }
  }

  @del('/users/{id}/user-profile', {
    responses: {
      '200': {
        description: 'User.UserProfile DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(UserProfile))
    where?: Where<UserProfile>,
  ): Promise<Count> {
    return this.userRepository.userProfile(id).delete(where);
  }
}
