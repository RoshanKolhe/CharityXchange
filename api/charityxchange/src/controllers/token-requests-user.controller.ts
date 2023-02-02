import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  TokenRequests,
  User,
} from '../models';
import {TokenRequestsRepository} from '../repositories';

export class TokenRequestsUserController {
  constructor(
    @repository(TokenRequestsRepository)
    public tokenRequestsRepository: TokenRequestsRepository,
  ) { }

  @get('/token-requests/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to TokenRequests',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(User)},
          },
        },
      },
    },
  })
  async getUser(
    @param.path.number('id') id: typeof TokenRequests.prototype.id,
  ): Promise<User> {
    return this.tokenRequestsRepository.user(id);
  }
}
