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
import {Cycles, PricingPlan, User, UserPricingPlan} from '../models';
import {
  AdminReceivedLinksRepository,
  PricingPlanRepository,
  UserLinksRepository,
  UserPricingPlanRepository,
} from '../repositories';
import generateCongratulationsTemplate from '../templates/congratulations.template';
import SITE_SETTINGS from '../utils/config';
import {LEVEL_PRICES, PER_LINK_HELP_AMOUNT} from '../utils/constants';
import {Credentials, UserRepository} from './../repositories/user.repository';
import {EmailManager} from './email.service';
import {BcryptHasher} from './hash.password.bcrypt';
import {MyUserService} from './user-service';

export class CyclesService {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject('datasources.charityxchangeSql')
    public dataSource: CharityxchangeSqlDataSource,
    @repository(UserLinksRepository)
    protected userLinksRepository: UserLinksRepository,
    @repository(AdminReceivedLinksRepository)
    protected adminReceivedLinksRepository: AdminReceivedLinksRepository,
    @inject(EmailManagerBindings.SEND_MAIL)
    public emailManager: EmailManager,
    @inject('service.user.service')
    public userService: MyUserService,
  ) {}

  async updateCycleAndSendEmailToUser(participatedUseres: any) {
    if (participatedUseres.length > 0) {
      for (const element of participatedUseres) {
        const userData = await this.userRepository.findById(element);
        await this.userRepository.updateById(element, {
          ...userData,
          cycles_participated: userData.cycles_participated + 1,
        });
        const template = generateCongratulationsTemplate();

        const mailOptions = {
          from: SITE_SETTINGS.fromMail,
          to: userData.email,
          subject: template.subject,
          html: template.html,
        };
        const data = await this.emailManager
          .sendMail(mailOptions)
          .then(function (res: any) {
            return Promise.resolve({
              success: true,
              message: `Credentials created and Successfully sent  mail to ${userData.email}`,
            });
          })
          .catch(function (err: any) {
            console.log(err);
            //   throw new HttpErrors.UnprocessableEntity(err);
          });
      }
    } else {
      throw new HttpErrors.NotFound('No Participated Users Found');
    }
  }

  async sendLevelIncomeAndEndCycle(participatedUseres: any) {
    if (participatedUseres.length > 0) {
      const adminBalance = await this.userRepository.adminBalances(5).get();
      for (const element of participatedUseres) {
        const userData = await this.userRepository.findOne({
          where: {
            id: element,
          },
          include: ['userProfile', 'balance_user', 'adminBalances'],
        });
        const userLevel = await this.userService.calculateUserLevel(userData);
        const createdAtDate = userData?.createdAt
          ? new Date(userData.createdAt)
          : new Date();
        const diffInMs = Date.now() - createdAtDate.getTime();
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        if (diffInDays <= 7) {
          await this.userRepository.balance_user(element).patch({
            is_first_level_price_taken: true,
            current_balance: userData?.balance_user.current_balance || 0 + 20,
            total_earnings: userData?.balance_user.total_earnings || 0 + 20,
          });

          await this.userRepository.adminBalances(5).patch({
            activation_help: adminBalance.activation_help - 20,
          });
        }
        console.log(userLevel);
        if (userLevel.level) {
          const price =
            LEVEL_PRICES[userLevel.level as keyof typeof LEVEL_PRICES];
          await this.userRepository.balance_user(element).patch({
            total_earnings:
              userData?.balance_user.total_earnings ||
              0 + price.levelIncome + price.awardOrReward,
            current_balance:
              userData?.balance_user.current_balance ||
              0 + price.levelIncome + price.awardOrReward,
          });
        }
      }
    }
  }
}
