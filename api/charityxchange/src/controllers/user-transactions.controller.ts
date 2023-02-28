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
import {User, Transactions} from '../models';
import {TransactionsRepository, UserRepository} from '../repositories';

export class UserTransactionsController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
    @repository(TransactionsRepository)
    protected transactionRepository: TransactionsRepository,
  ) {}

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
}
