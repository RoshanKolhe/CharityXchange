import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  DefaultTransactionalRepository,
  Filter,
  InclusionFilter,
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
import {UserProfile} from '@loopback/security';
import {CharityxchangeSqlDataSource} from '../datasources';
import {User, Withdraws} from '../models';
import {UserRepository} from '../repositories';
import {TransactionService} from '../services/transaction.service';
import {MyUserService} from '../services/user-service';
import {LOCK_PRICE} from '../utils/constants';

export class UserWithdrawsController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
    @inject('service.user.service')
    public userService: MyUserService,
    @inject('service.transaction.service')
    public transactionService: TransactionService,
    @inject('datasources.charityxchangeSql')
    public dataSource: CharityxchangeSqlDataSource,
  ) {}

  @authenticate('jwt')
  @get('/users/withdraws', {
    responses: {
      '200': {
        description: 'Array of User has many Withdraws',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Withdraws)},
          },
        },
      },
    },
  })
  async find(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @param.query.object('filter') filter?: Filter<Withdraws>,
  ): Promise<Withdraws[]> {
    return this.userRepository.withdraws(currnetUser.id).find(filter);
  }

  @authenticate('jwt')
  @post('/users/withdraws', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(Withdraws)}},
      },
    },
  })
  async create(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,

    @requestBody()
    withdraws: any,
  ): Promise<any> {
    const repo = new DefaultTransactionalRepository(User, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    try {
      const include: InclusionFilter[] = [
        {relation: 'userProfile'},
        {relation: 'balance_user'},
      ];
      const currentUserData = await this.userRepository.findById(
        currnetUser.id,
        {
          include,
        },
      );
      const currentBalance = currentUserData.balance_user.current_balance;
      const currentUserActivePlan =
        await this.userService.getCurrentUserActivePack(currnetUser);
      let withdrawableAmount = 0;
      if (
        currentUserData &&
        currentUserData?.balance_user &&
        Object.prototype.hasOwnProperty.call(
          currentUserData,
          'level_cycles_participated',
        )
      ) {
        if (currentUserData.level_cycles_participated > 4) {
          withdrawableAmount =
            currentBalance -
            LOCK_PRICE[
              currentUserActivePlan?.total_links as keyof typeof LOCK_PRICE
            ];
        } else {
          withdrawableAmount = currentBalance;
        }
      }
      if (
        currentBalance <= withdrawableAmount &&
        withdraws.amount <= withdrawableAmount
      ) {
        const inputdata: any = {
          amount: withdraws.amount,
          status: false,
          details: withdraws.details,
          note: withdraws.details,
        };
        await this.userRepository.balance_user(currnetUser.id).patch(
          {
            current_balance: currentBalance - withdraws.amount,
            withdrawn_amount: currentBalance + withdraws.amount,
          },
          {transaction: tx},
        );
        await this.userRepository
          .withdraws(currnetUser.id)
          .create(inputdata, {transaction: tx});
        tx.commit();
        return Promise.resolve({
          success: true,
          message: 'Withdraw request sent successfully',
        });
      } else {
        tx.rollback();
        throw new HttpErrors[400]('Not enough balance');
      }
    } catch (err) {
      tx.rollback();
      throw new HttpErrors[400](err);
    }
  }

  @authenticate('jwt')
  @patch('/users/withdraws', {
    responses: {
      '200': {
        description: 'User.Withdraws PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Withdraws, {partial: true}),
        },
      },
    })
    withdraws: Partial<Withdraws>,
    @param.query.object('where', getWhereSchemaFor(Withdraws))
    where?: Where<Withdraws>,
  ): Promise<Count> {
    return this.userRepository
      .withdraws(currnetUser.id)
      .patch(withdraws, where);
  }

  @authenticate('jwt')
  @del('/users/withdraws', {
    responses: {
      '200': {
        description: 'User.Withdraws DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @param.query.object('where', getWhereSchemaFor(Withdraws))
    where?: Where<Withdraws>,
  ): Promise<Count> {
    return this.userRepository.withdraws(currnetUser.id).delete(where);
  }
}
