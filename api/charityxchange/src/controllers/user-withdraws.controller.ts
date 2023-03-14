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
import {EmailManagerBindings} from '../keys';
import {AdminBalances, User, Withdraws} from '../models';
import {UserRepository, WithdrawsRepository} from '../repositories';
import {EmailManager} from '../services/email.service';
import {TransactionService} from '../services/transaction.service';
import {MyUserService} from '../services/user-service';
import generateWithdrawRequestSentTemplate from '../templates/withdrawrequest.template';
import SITE_SETTINGS from '../utils/config';
import {
  ADMIN_ID,
  generateTransactionId,
  LOCK_PRICE,
  TRANSACTION_TYPES,
} from '../utils/constants';

export class UserWithdrawsController {
  constructor(
    @repository(UserRepository)
    protected userRepository: UserRepository,
    @repository(WithdrawsRepository)
    protected withdrawRepository: WithdrawsRepository,
    @inject('service.user.service')
    public userService: MyUserService,
    @inject('service.transaction.service')
    public transactionService: TransactionService,
    @inject('datasources.charityxchangeSql')
    public dataSource: CharityxchangeSqlDataSource,
    @inject(EmailManagerBindings.SEND_MAIL)
    public emailManager: EmailManager,
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

        // const transactionDetails: any = {
        //   transaction_id: generateTransactionId(),
        //   remark: 'Amount Withdrawl',
        //   amount: withdraws.amount,
        //   type: 'Withdrawl',
        //   status: false,
        //   transaction_fees: 3,
        //   transaction_type: TRANSACTION_TYPES.WITHDRAWL,
        // };
        // await this.userRepository
        //   .transactions(currnetUser.id)
        //   .create(transactionDetails, {transaction: tx});
        tx.commit();
        return Promise.resolve({
          success: true,
          message: 'Withdraw request sent successfully',
        });
      } else {
        tx.rollback();
        return Promise.reject({
          status:400,
          message: 'Not enough balance',
        });
      }
    } catch (err) {
      if (tx.isActive()) {
        tx.rollback();
      }
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

  @authenticate('jwt')
  @patch('/approveWithdrawRequest')
  async approveWithdrawRequest(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Withdraws, {partial: true}),
        },
      },
    })
    withdraws: Withdraws,
  ): Promise<any> {
    const repo = new DefaultTransactionalRepository(User, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    try {
      const adminBalance = await this.userRepository
        .adminBalances(ADMIN_ID)
        .get();
      const percentMinusAmount = withdraws.amount * 0.1;
      const userData = await this.userRepository.findById(withdraws.userId);
      const withdrawnAmountInput: Partial<AdminBalances> = {
        withdrawn_amount:
          adminBalance.withdrawn_amount +
          (withdraws.amount - (percentMinusAmount + 3)),
      };
      await this.userRepository
        .adminBalances(ADMIN_ID)
        .patch(withdrawnAmountInput, {transaction: tx});
      await this.userRepository.withdraws(withdraws.userId).patch(
        {
          status: true,
        },
        {
          id: withdraws.id,
        },
        {transaction: tx},
      );

      const transactionDetails: any = {
        transaction_id: generateTransactionId(),
        remark: 'Withdraw Approved',
        amount: withdraws.amount - (percentMinusAmount + 3),
        type: 'Sent',
        status: true,
        transaction_fees: 3,
        admin_fees: percentMinusAmount,
        transaction_type: TRANSACTION_TYPES.WITHDRAWL_REQUEST,
      };
      await this.userRepository
        .transactions(withdraws.userId)
        .create(transactionDetails, {transaction: tx});
      const template = generateWithdrawRequestSentTemplate();

      const mailOptions = {
        from: SITE_SETTINGS.fromMail,
        to: userData.email,
        subject: template.subject,
        html: template.html,
      };
      const data = await this.emailManager
        .sendMail(mailOptions)
        .then(function (res: any) {})
        .catch(function (err: any) {
          console.log(err);
          //   throw new HttpErrors.UnprocessableEntity(err);
        });
      tx.commit();
      return Promise.resolve({
        success: true,
        message: 'Withdraw Request Approved Successfully',
      });
    } catch (err) {
      tx.rollback();
      throw new HttpErrors[400](err);
    }
  }

  @authenticate('jwt')
  @get('/allWithdrawlRequests', {
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
  async allWithdrawlRequests(
    @param.query.object('filter') filter?: Filter<Withdraws>,
  ): Promise<Withdraws[]> {
    const include: InclusionFilter[] = [
      {
        relation: 'user',
        scope: {
          include: [
            {
              relation: 'userProfile',
            },
            {
              relation: 'balance_user',
            },
          ],
        },
      },
    ];
    filter = {...filter, include};
    return this.withdrawRepository.find(filter);
  }
}
