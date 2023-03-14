import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Withdraws,
  User,
} from '../models';
import {WithdrawsRepository} from '../repositories';

export class WithdrawsUserController {
  constructor(
    @repository(WithdrawsRepository)
    public withdrawsRepository: WithdrawsRepository,
  ) { }

  @get('/withdraws/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to Withdraws',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(User)},
          },
        },
      },
    },
  })
  async getUser(
    @param.path.number('id') id: typeof Withdraws.prototype.id,
  ): Promise<User> {
    return this.withdrawsRepository.user(id);
  }
}
