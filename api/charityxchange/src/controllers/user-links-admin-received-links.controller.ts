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
  UserLinks,
  AdminReceivedLinks,
} from '../models';
import {UserLinksRepository} from '../repositories';

export class UserLinksAdminReceivedLinksController {
  constructor(
    @repository(UserLinksRepository) protected userLinksRepository: UserLinksRepository,
  ) { }

  @get('/user-links/{id}/admin-received-links', {
    responses: {
      '200': {
        description: 'Array of UserLinks has many AdminReceivedLinks',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(AdminReceivedLinks)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<AdminReceivedLinks>,
  ): Promise<AdminReceivedLinks[]> {
    return this.userLinksRepository.adminReceivedLinks(id).find(filter);
  }

  @post('/user-links/{id}/admin-received-links', {
    responses: {
      '200': {
        description: 'UserLinks model instance',
        content: {'application/json': {schema: getModelSchemaRef(AdminReceivedLinks)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof UserLinks.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AdminReceivedLinks, {
            title: 'NewAdminReceivedLinksInUserLinks',
            exclude: ['id'],
            optional: ['userLinksId']
          }),
        },
      },
    }) adminReceivedLinks: Omit<AdminReceivedLinks, 'id'>,
  ): Promise<AdminReceivedLinks> {
    return this.userLinksRepository.adminReceivedLinks(id).create(adminReceivedLinks);
  }

  @patch('/user-links/{id}/admin-received-links', {
    responses: {
      '200': {
        description: 'UserLinks.AdminReceivedLinks PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AdminReceivedLinks, {partial: true}),
        },
      },
    })
    adminReceivedLinks: Partial<AdminReceivedLinks>,
    @param.query.object('where', getWhereSchemaFor(AdminReceivedLinks)) where?: Where<AdminReceivedLinks>,
  ): Promise<Count> {
    return this.userLinksRepository.adminReceivedLinks(id).patch(adminReceivedLinks, where);
  }

  @del('/user-links/{id}/admin-received-links', {
    responses: {
      '200': {
        description: 'UserLinks.AdminReceivedLinks DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(AdminReceivedLinks)) where?: Where<AdminReceivedLinks>,
  ): Promise<Count> {
    return this.userLinksRepository.adminReceivedLinks(id).delete(where);
  }
}
