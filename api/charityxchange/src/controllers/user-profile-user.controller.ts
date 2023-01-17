import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  UserProfile,
  User,
} from '../models';
import {UserProfileRepository} from '../repositories';

export class UserProfileUserController {
  constructor(
    @repository(UserProfileRepository)
    public userProfileRepository: UserProfileRepository,
  ) { }

  @get('/user-profiles/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to UserProfile',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(User)},
          },
        },
      },
    },
  })
  async getUser(
    @param.path.string('id') id: typeof UserProfile.prototype.id,
  ): Promise<User> {
    return this.userProfileRepository.user(id);
  }
}
