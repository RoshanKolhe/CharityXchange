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
import {ADMIN_ID, LEVEL_PRICES, PER_LINK_HELP_AMOUNT} from '../utils/constants';
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

  async sendCongratulationEmailToAllParticipatedUser(allUserRecords: any) {
    if (allUserRecords.length > 0) {
      allUserRecords = allUserRecords.filter(
        (record: User) => !record.permissions.includes('super_admin'),
      );
      for (const userData of allUserRecords) {
        const template = generateCongratulationsTemplate();

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
      }
    } else {
      throw new HttpErrors.NotFound('No Participated Users Found');
    }
  }
}
