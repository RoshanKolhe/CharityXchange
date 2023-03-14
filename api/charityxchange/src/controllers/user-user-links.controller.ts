import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {securityId, UserProfile} from '@loopback/security';
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
import {User, UserLinks} from '../models';
import {UserLinksRepository, UserRepository} from '../repositories';
import {MyUserService} from '../services/user-service';
import {CharityxchangeSqlDataSource} from '../datasources';
import {omit} from 'lodash';
import {TransactionService} from '../services/transaction.service';
import {
  ADMIN_ID,
  generateTransactionId,
  TRANSACTION_TYPES,
} from '../utils/constants';
import {throws} from 'should';

export class UserUserLinksController {
  constructor(
    @inject('datasources.charityxchangeSql')
    public dataSource: CharityxchangeSqlDataSource,
    @repository(UserRepository)
    protected userRepository: UserRepository,
    @inject('service.user.service')
    public userService: MyUserService,
    @repository(UserLinksRepository)
    protected userLinksRepository: UserLinksRepository,
    @inject('service.transaction.service')
    public transactionService: TransactionService,
  ) {}

  @authenticate('jwt')
  @get('/users/user-links', {
    responses: {
      '200': {
        description: 'Array of User has many UserLinks',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(UserLinks)},
          },
        },
      },
    },
  })
  async find(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @param.query.object('filter') filter?: Filter<UserLinks>,
  ): Promise<UserLinks[]> {
    try {
      const userLinks = await this.userRepository
        .userLinks(currnetUser.id)
        .find(filter);

      const currentUserData = await this.userRepository.findById(
        currnetUser.id,
      );

      const linksNotSent = userLinks.filter(res => {
        return !res.is_send_to_admin;
      });
      const linkSendToAdminButHelpNotRceived = userLinks.filter(res => {
        return res.is_send_to_admin && !res.is_help_received;
      });

      if (linkSendToAdminButHelpNotRceived.length === 0) {
        const currentUserActivePlan =
          await this.userService.getCurrentUserActivePack(currnetUser);
        if (linksNotSent.length < currentUserActivePlan.total_links) {
          const linksToAddCount =
            currentUserActivePlan.total_links - linksNotSent.length;
          const previousLinkCount = await (
            await this.userRepository.userLinks(currnetUser.id).find()
          ).length;

          await this.userRepository.updateById(currnetUser.id, {
            level_cycles_participated:
              currentUserData.level_cycles_participated || 0 + 1,
          });

          for (let i = 0; i < linksToAddCount; i++) {
            const userLinkData = {
              linkName: currnetUser.name
                ? `${currnetUser?.id}-` + (previousLinkCount + i + 1)
                : `${new Date()}`,
              is_active: false,
              is_help_send: false,
              is_help_received: false,
              is_send_to_admin: false,
            };
            await this.userRepository
              .userLinks(currnetUser.id)
              .create(userLinkData);
          }
        }
      }

      return this.userRepository.userLinks(currnetUser.id).find(filter);
    } catch (err) {
      throw HttpErrors[400](err);
    }
  }

  @post('/users/{id}/user-links', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(UserLinks)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserLinks, {
            title: 'NewUserLinksInUser',
            exclude: ['id'],
            optional: ['userId'],
          }),
        },
      },
    })
    userLinks: Omit<UserLinks, 'id'>,
  ): Promise<UserLinks> {
    return this.userRepository.userLinks(id).create(userLinks);
  }

  @authenticate('jwt')
  @patch('/users/user-links', {
    responses: {
      '200': {
        description: 'User.UserLinks PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserLinks, {partial: true}),
        },
      },
    })
    userLinks: Partial<UserLinks>,
    @param.query.object('where', getWhereSchemaFor(UserLinks))
    where?: Where<UserLinks>,
  ): Promise<Count> {
    return this.userRepository
      .userLinks(currnetUser.id)
      .patch(userLinks, where);
  }

  @authenticate('jwt')
  @patch('/users/update-user-link', {
    responses: {
      '200': {
        description: 'User.UserLinks PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateActiveUserLink(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserLinks, {partial: true}),
        },
      },
    })
    userLinks: Partial<UserLinks>,
    @param.query.object('where', getWhereSchemaFor(UserLinks))
    where?: Where<UserLinks>,
  ): Promise<any> {
    const repo = new DefaultTransactionalRepository(User, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    try {
      if (userLinks.activationStartTime && userLinks.activationEndTime) {
        const currentUserbalance = await this.userRepository
          .balance_user(currnetUser.id)
          .get();
        const adminBalance = await this.userRepository
          .adminBalances(ADMIN_ID)
          .get();
        await this.userRepository.balance_user(currnetUser.id).patch(
          {
            current_balance: currentUserbalance.current_balance - 10,
          },
          {transaction: tx},
        );
        await this.userRepository.adminBalances(ADMIN_ID).patch(
          {
            current_balance: adminBalance.current_balance + 10,
            activation_help: adminBalance.activation_help + 10,
          },
          {transaction: tx},
        );
      }

      await this.userRepository
        .userLinks(currnetUser.id)
        .patch(userLinks, where, {transaction: tx});
      const transactionDetails: any = {
        transaction_id: generateTransactionId(),
        remark: `Activated Link #${userLinks.linkName}`,
        amount: 10,
        type: 'Debited',
        status: true,
        transaction_fees: 0,
        transaction_type: TRANSACTION_TYPES.LINK_ACTIVATION,
      };
      await this.userRepository
        .transactions(currnetUser.id)
        .create(transactionDetails, {transaction: tx});
      tx.commit();

      return Promise.resolve({
        success: true,
        message: 'Successfully Activated The link',
      });
    } catch (err) {
      tx.rollback();
      throw new HttpErrors[400](err);
    }
  }

  @authenticate('jwt')
  @patch('/users/update-user-help-link', {
    responses: {
      '200': {
        description: 'User.UserLinks PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateSendHelpLink(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserLinks, {partial: true}),
        },
      },
    })
    userLinks: Partial<UserLinks>,
    @param.query.object('where', getWhereSchemaFor(UserLinks))
    where?: Where<UserLinks>,
  ): Promise<any> {
    const repo = new DefaultTransactionalRepository(User, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    try {
      if (userLinks.activationStartTime && userLinks.activationEndTime) {
        const currentUserbalance = await this.userRepository
          .balance_user(currnetUser.id)
          .get();
        const adminBalance = await this.userRepository
          .adminBalances(ADMIN_ID)
          .get();
        await this.userRepository.balance_user(currnetUser.id).patch(
          {
            current_balance: currentUserbalance.current_balance - 20,
            chxtToken: currentUserbalance.chxtToken + 200,
          },
          {transaction: tx},
        );
        await this.userRepository.adminBalances(ADMIN_ID).patch(
          {
            current_balance: adminBalance.current_balance + 20,
            total_help_received: adminBalance.total_help_received + 20,
          },
          {transaction: tx},
        );
      }
      await this.userRepository
        .userLinks(currnetUser.id)
        .patch(
          {...userLinks, activationEndTime: null, activationStartTime: null},
          where,
          {transaction: tx},
        );
      const userAllLinks = await this.userRepository
        .userLinks(currnetUser.id)
        .find();
      const linksNotSent = userAllLinks.filter(res => {
        return !res.is_send_to_admin && res.is_active && res.is_help_send;
      });
      const currentUserActivePlan =
        await this.userService.getCurrentUserActivePack(currnetUser);
      if (linksNotSent.length + 1 === currentUserActivePlan.total_links) {
        for (
          let i = 0;
          i < this.calculateBasedOnTotalLink(currentUserActivePlan.total_links);
          i++
        ) {
          let userLinkData = {
            ...linksNotSent[i],
            is_send_to_admin: this.calculateBasedOnTotalLinkForSendHelp(
              currentUserActivePlan.total_links,
              i,
            ),
          };

          // userLinkData = omit(userLinkData, 'userId');
          await this.userRepository
            .userLinks(currnetUser.id)
            .patch(userLinkData, {id: userLinkData.id}, {transaction: tx});
          if (userLinkData.is_send_to_admin) {
            const updatedUserLinkData = omit(
              userLinkData,
              'id',
              'is_help_received',
              'activationStartTime',
              'activationEndTime',
            );
            await this.userLinksRepository
              .adminReceivedLinks(userLinkData.id)
              .create(
                {...updatedUserLinkData, is_help_send_to_user: false},
                {transaction: tx},
              );
          }
        }
      }

      const transactionDetails: any = {
        transaction_id: generateTransactionId(),
        remark: `Reward sent to link #${userLinks.linkName}`,
        amount: 20,
        type: 'Debited',
        status: true,
        transaction_fees: 0,
        transaction_type: TRANSACTION_TYPES.LINK_HELP,
      };
      await this.userRepository
        .transactions(currnetUser.id)
        .create(transactionDetails, {transaction: tx});
      tx.commit();
      return Promise.resolve({
        success: true,
        message: 'Successfully Activated The link',
      });
    } catch (err) {
      tx.rollback();
      throw new HttpErrors[400](err);
    }
  }

  calculateBasedOnTotalLink(total_links: any): number {
    if (total_links == 3) {
      return 1;
    } else if (total_links == 5) {
      return 2;
    } else if (total_links == 11) {
      return 5;
    }
    return 0;
  }
  
  @authenticate('jwt')
  @del('/users/{id}/user-links', {
    responses: {
      '200': {
        description: 'User.UserLinks DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(UserLinks))
    where?: Where<UserLinks>,
  ): Promise<Count> {
    return this.userRepository.userLinks(id).delete(where);
  }

  calculateBasedOnTotalLinkForSendHelp(
    total_links: any,
    index: number,
  ): boolean {
    if (total_links == 3) {
      if (index == 0) {
        return true;
      }
    } else if (total_links == 5) {
      if (index == 0) {
        return true;
      } else if (index == 1) {
        return true;
      }
    } else if (total_links == 11) {
      if (index == 0) {
        return true;
      } else if (index == 1) {
        return true;
      } else if (index == 2) {
        return true;
      } else if (index == 3) {
        return true;
      } else if (index == 4) {
        return true;
      }
    }
    return false;
  }
}
