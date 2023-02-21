import {AuthenticationBindings, UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  DefaultTransactionalRepository,
  IsolationLevel,
  repository,
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
import {PER_LINK_HELP_AMOUNT} from '../utils/constants';
import {Credentials, UserRepository} from './../repositories/user.repository';
import {EmailManager} from './email.service';
import {BcryptHasher} from './hash.password.bcrypt';

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
  ) {}

  async sendNonWorkingMoneyToUser(allLinksBetweenDates: any) {
    for (const adminReceivedLink of allLinksBetweenDates) {
      const repo = new DefaultTransactionalRepository(Cycles, this.dataSource);
      const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
      try {
        const adminBalances = await this.userRepository.adminBalances(5).get();
        const userLinkData = await this.userLinksRepository.findById(
          adminReceivedLink.userLinksId,
        );
        if (userLinkData) {
          const userBalance = await this.userRepository
            .balance_user(userLinkData.userId)
            .get();
          await this.userRepository.adminBalances(5).patch(
            {
              total_supply: adminBalances.total_supply - PER_LINK_HELP_AMOUNT,
              total_help_send:
                adminBalances.total_help_send + PER_LINK_HELP_AMOUNT,
            },
            {transaction: tx},
          );
          await this.userRepository.balance_user(userLinkData.userId).patch(
            {
              total_earnings: userBalance.total_earnings + PER_LINK_HELP_AMOUNT,
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
        // throw new HttpErrors[400](err);
      }
    }
  }

  async updateCycleAndSendEmailToUser(participatedUseres: any) {
    if (participatedUseres.length > 0) {
      for (const element of participatedUseres) {
        const userData = await this.userRepository.findById(element);
        await this.userRepository.updateById(element, {
          ...userData,
          cycles_participated: userData.cycles_participated + 1,
        });
        // const template = generateCongratulationsTemplate();

        // const mailOptions = {
        //   from: SITE_SETTINGS.fromMail,
        //   to: userData.email,
        //   subject: template.subject,
        //   html: template.html,
        // };
        // const data = await this.emailManager
        //   .sendMail(mailOptions)
        //   .then(function (res: any) {
        //     return Promise.resolve({
        //       success: true,
        //       message: `Credentials created and Successfully sent  mail to ${userData.email}`,
        //     });
        //   })
        //   .catch(function (err: any) {
        //     console.log(err);
        //     //   throw new HttpErrors.UnprocessableEntity(err);
        //   });
      }
    } else {
      throw new HttpErrors.NotFound('No Participated Users Found');
    }
  }
}
