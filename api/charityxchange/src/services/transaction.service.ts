import {AuthenticationBindings, UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  DefaultTransactionalRepository,
  IsolationLevel,
  repository,
  Transaction,
} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {CharityxchangeSqlDataSource} from '../datasources';
import {EmailManagerBindings} from '../keys';
import {
  Cycles,
  PricingPlan,
  Transactions,
  User,
  UserPricingPlan,
} from '../models';
import {
  AdminReceivedLinksRepository,
  PricingPlanRepository,
  TransactionsRepository,
  UserLinksRepository,
  UserPricingPlanRepository,
} from '../repositories';
import generateCongratulationsTemplate from '../templates/congratulations.template';
import SITE_SETTINGS from '../utils/config';
import {ADMIN_ID, LEVEL_PRICES, PER_LINK_HELP_AMOUNT} from '../utils/constants';
import {Credentials, UserRepository} from './../repositories/user.repository';
import {EmailManager} from './email.service';
import {BcryptHasher} from './hash.password.bcrypt';
import {MyUserService} from './user-service';

export class TransactionService {
  constructor(
    @repository(TransactionsRepository)
    public transactionRepository: TransactionsRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  async createTransaction(transaction: Transactions, userId: any) {
    return await this.userRepository.transactions(userId).create(transaction);
  }
}
