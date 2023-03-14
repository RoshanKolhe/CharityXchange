import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  UserLinks,
  User,
} from '../models';
import {UserLinksRepository} from '../repositories';

export class UserLinksUserController {
  constructor(
    @repository(UserLinksRepository)
    public userLinksRepository: UserLinksRepository,
  ) { }

  @get('/user-links/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to UserLinks',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(User)},
          },
        },
      },
    },
  })
  async getUser(
    @param.path.number('id') id: typeof UserLinks.prototype.id,
  ): Promise<User> {
    return this.userLinksRepository.user(id);
  }
}
