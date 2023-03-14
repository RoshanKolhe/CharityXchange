import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  AdminReceivedLinks,
  UserLinks,
} from '../models';
import {AdminReceivedLinksRepository} from '../repositories';

export class AdminReceivedLinksUserLinksController {
  constructor(
    @repository(AdminReceivedLinksRepository)
    public adminReceivedLinksRepository: AdminReceivedLinksRepository,
  ) { }

  @get('/admin-received-links/{id}/user-links', {
    responses: {
      '200': {
        description: 'UserLinks belonging to AdminReceivedLinks',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(UserLinks)},
          },
        },
      },
    },
  })
  async getUserLinks(
    @param.path.number('id') id: typeof AdminReceivedLinks.prototype.id,
  ): Promise<UserLinks> {
    return this.adminReceivedLinksRepository.userLinks(id);
  }
}
