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
  HttpErrors,
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
import {ADMIN_ID, PER_LINK_HELP_AMOUNT} from '../utils/constants';

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
    @requestBody({})
    adminReceivedLinkIds: any,
  ): Promise<any> {
    if (adminReceivedLinkIds.linkIds.length > 0) {
      for (const res of adminReceivedLinkIds.linkIds) {
        const repo = new DefaultTransactionalRepository(User, this.dataSource);
        const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
        try {
          const adminReceivedLink =
            await this.adminReceivedLinksRepository.findById(res);
          const adminBalances = await this.userRepository
            .adminBalances(ADMIN_ID)
            .get();
          const userLinkData = await this.userLinksRepository.findById(
            adminReceivedLink.userLinksId,
          );
          if (userLinkData) {
            const userBalance = await this.userRepository
              .balance_user(userLinkData.userId)
              .get();
            await this.userRepository.adminBalances(ADMIN_ID).patch(
              {
                total_supply: adminBalances.total_supply - PER_LINK_HELP_AMOUNT,
                total_help_send:
                  adminBalances.total_help_send + PER_LINK_HELP_AMOUNT,
              },
              {transaction: tx},
            );
            await this.userRepository.balance_user(userLinkData.userId).patch(
              {
                total_earnings:
                  userBalance.total_earnings + PER_LINK_HELP_AMOUNT,
                current_balance:
                  userBalance.current_balance + PER_LINK_HELP_AMOUNT,
              },
              {transaction: tx},
            );
            await this.userLinksRepository.updateById(
              adminReceivedLink.userLinksId,
              {
                is_help_received: true,
              },
              {transaction: tx},
            );
            await this.adminReceivedLinksRepository.updateById(
              adminReceivedLink.id,
              {
                is_help_send_to_user: true,
              },
              {transaction: tx},
            );
          }
          tx.commit();
        } catch (err) {
          tx.rollback();
          throw new HttpErrors[400](err);
        }
      }
      return Promise.resolve({
        success: true,
        message: 'Help Sent Successfully',
      });
    }
    throw new HttpErrors[400]('Please provide an non empty array');
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @post('/user-links/adminCycle-user-links', {
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
  async getAdminReceivedLinksBetweenDates(
    @requestBody() cycleData: any,
    @param.query.object('filter') filter?: Filter<AdminReceivedLinks>,
  ): Promise<AdminReceivedLinks[]> {
    const startDate = cycleData.startDate;
    const endDate = cycleData.endDate;
    return this.adminReceivedLinksRepository.find(
      {
        where: {
          createdAt: {
            between: [startDate, endDate],
          },
          is_help_send_to_user: false,
        },
      },
      filter,
    );
  }
}
