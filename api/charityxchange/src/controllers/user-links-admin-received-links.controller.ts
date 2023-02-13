import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {UserProfile} from '@loopback/security';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  DefaultTransactionalRepository,
  Filter,
  IsolationLevel,
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
import {PermissionKeys} from '../authorization/permission-keys';
import {CharityxchangeSqlDataSource} from '../datasources';
import {UserLinks, AdminReceivedLinks, User} from '../models';
import {
  AdminReceivedLinksRepository,
  UserLinksRepository,
  UserRepository,
} from '../repositories';

export class UserLinksAdminReceivedLinksController {
  constructor(
    @inject('datasources.charityxchangeSql')
    public dataSource: CharityxchangeSqlDataSource,
    @repository(UserLinksRepository)
    protected userLinksRepository: UserLinksRepository,
    @repository(AdminReceivedLinksRepository)
    protected adminReceivedLinksRepository: AdminReceivedLinksRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @get('/user-links/admin-received-links', {
    responses: {
      '200': {
        description: 'Array of UserLinks has many AdminReceivedLinks',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(AdminReceivedLinks),
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter') filter?: Filter<AdminReceivedLinks>,
  ): Promise<AdminReceivedLinks[]> {
    return this.adminReceivedLinksRepository.find(filter);
  }

  @post('/user-links/{id}/admin-received-links', {
    responses: {
      '200': {
        description: 'UserLinks model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(AdminReceivedLinks)},
        },
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
            optional: ['userLinksId'],
          }),
        },
      },
    })
    adminReceivedLinks: Omit<AdminReceivedLinks, 'id'>,
  ): Promise<AdminReceivedLinks> {
    return this.userLinksRepository
      .adminReceivedLinks(id)
      .create(adminReceivedLinks);
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
    @param.query.object('where', getWhereSchemaFor(AdminReceivedLinks))
    where?: Where<AdminReceivedLinks>,
  ): Promise<Count> {
    return this.userLinksRepository
      .adminReceivedLinks(id)
      .patch(adminReceivedLinks, where);
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
    @param.query.object('where', getWhereSchemaFor(AdminReceivedLinks))
    where?: Where<AdminReceivedLinks>,
  ): Promise<Count> {
    return this.userLinksRepository.adminReceivedLinks(id).delete(where);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @patch('/sendHelpToLink', {
    responses: {
      '200': {
        description: 'UserLinks.AdminReceivedLinks PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async sendHelpToUserLink(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AdminReceivedLinks, {partial: true}),
        },
      },
    })
    adminReceivedLinks: Partial<AdminReceivedLinks>,
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @param.query.object('where', getWhereSchemaFor(AdminReceivedLinks))
    where?: Where<AdminReceivedLinks>,
  ): Promise<any> {
    const repo = new DefaultTransactionalRepository(User, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    try {
      const userLink = await this.userRepository
        .balance_user(currnetUser.id)
        .get();
      console.log('currentBalanceOfUser', userLink);
    } catch (err) {}
  }
}
