import {authenticate} from '@loopback/authentication';
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
  HttpErrors,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {PermissionKeys} from '../authorization/permission-keys';
import {User, Transactions} from '../models';
import {TransactionsRepository, UserRepository} from '../repositories';
import {TRANSACTION_TYPES} from '../utils/constants';

export class UserTransactionsController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
    @repository(TransactionsRepository)
    protected transactionRepository: TransactionsRepository,
  ) {}

  @authenticate('jwt')
  @get('/users/{id}/transactions', {
    responses: {
      '200': {
        description: 'Array of User has many Transactions',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Transactions)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Transactions>,
  ): Promise<Transactions[]> {
    return this.userRepository.transactions(id).find(filter);
  }
  
  @authenticate('jwt')
  @post('/users/{id}/transactions', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(Transactions)},
        },
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Transactions, {
            title: 'NewTransactionsInUser',
            exclude: ['id'],
            optional: ['userId'],
          }),
        },
      },
    })
    transactions: Omit<Transactions, 'id'>,
  ): Promise<Transactions> {
    return this.userRepository.transactions(id).create(transactions);
  }

  @authenticate('jwt')
  @patch('/users/{id}/transactions', {
    responses: {
      '200': {
        description: 'User.Transactions PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Transactions, {partial: true}),
        },
      },
    })
    transactions: Partial<Transactions>,
    @param.query.object('where', getWhereSchemaFor(Transactions))
    where?: Where<Transactions>,
  ): Promise<Count> {
    return this.userRepository.transactions(id).patch(transactions, where);
  }

  @authenticate('jwt')
  @del('/users/{id}/transactions', {
    responses: {
      '200': {
        description: 'User.Transactions DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Transactions))
    where?: Where<Transactions>,
  ): Promise<Count> {
    return this.userRepository.transactions(id).delete(where);
  }

  @authenticate('jwt')
  @get('/transactions', {
    responses: {
      '200': {
        description: 'Array of User has many Transactions',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Transactions)},
          },
        },
      },
    },
  })
  async getAllTransaction(
    @param.query.object('filter') filter?: Filter<Transactions>,
  ): Promise<Transactions[]> {
    return this.transactionRepository.find(filter);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @get('/getTodaysBusiness')
  async getTodaysBusiness(): Promise<any> {
    try {
      const now = new Date();
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        12,
        0,
        0,
        0,
      );
      const end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      );

      const filterObj = {
        where: {
          and: [{createdAt: {gte: start}}, {createdAt: {lte: end}}],
        },
      };
      const allTransaction = await this.transactionRepository.find(filterObj);

      const planBought = allTransaction.filter(
        transaction =>
          transaction.transaction_type === TRANSACTION_TYPES.PRICING_PlAN,
      );
      const linkActivation = allTransaction.filter(
        transaction =>
          transaction.transaction_type === TRANSACTION_TYPES.LINK_ACTIVATION,
      );
      const helpSend = allTransaction.filter(
        transaction =>
          transaction.transaction_type === TRANSACTION_TYPES.LINK_HELP,
      );

      let planBoughtTotal = 0;
      for (const plan of planBought) {
        planBoughtTotal = plan.amount;
      }

      let linkActivationTotal = 0;
      for (const link of linkActivation) {
        linkActivationTotal = link.amount;
      }

      let linkHelpTotal = 0;
      for (const link of helpSend) {
        linkHelpTotal = link.amount;
      }

      return Promise.resolve({
        planBoughtCount: planBought.length,
        planBoughtTotal: planBoughtTotal,
        linkActivationCount: linkActivation.length,
        linkActivationTotal: linkActivationTotal,
        linkHelpCount: helpSend.length,
        linkHelpTotal: linkHelpTotal,
      });
    } catch (err) {
      throw new HttpErrors[400](err);
    }
  }
}
