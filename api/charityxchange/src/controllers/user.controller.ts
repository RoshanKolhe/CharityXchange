import {securityId, UserProfile} from '@loopback/security';
import {
  DefaultTransactionalRepository,
  Filter,
  IsolationLevel,
  repository,
} from '@loopback/repository';
import {
  get,
  getJsonSchemaRef,
  getModelSchemaRef,
  HttpErrors,
  param,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import SITE_SETTINGS from '../utils/config';
import {
  ADMIN_ID,
  CHXT_COUNT,
  generateTransactionId,
  TRANSACTION_TYPES,
  USERLINKACTIVEANDHELPSEND,
} from '../utils/constants';

import {
  PricingPlan,
  User,
  UserPricingPlan,
  UserProfile as UserProfileData,
} from '../models';
import {
  Credentials,
  PricingPlanRepository,
  UserLinksRepository,
  UserPricingPlanRepository,
  UserRepository,
} from '../repositories';
import * as _ from 'lodash';
import {validateCredentials} from '../services/validator';
import {inject} from '@loopback/core';
import {BcryptHasher} from '../services/hash.password.bcrypt';
import {
  CredentialsRequestBody,
  PackageSubscriptionRequestBody,
} from './specs/user-controller-spec';
import {MyUserService} from '../services/user-service';
import {JWTService} from '../services/jwt-service';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';
import {EmailManager} from '../services/email.service';
import {EmailManagerBindings} from '../keys';
import generateOtpTemplate from '../templates/otp.template';
import generateEmailAndPasswordTemplate from '../templates/email-and-password.template';
import {CharityxchangeSqlDataSource} from '../datasources';
import {omit} from 'lodash';
import {TransactionService} from '../services/transaction.service';

const UserLoginSchema = {
  type: 'object',
  properties: {
    user: {
      type: User,
    },
    userPofile: {
      type: 'string',
    },
  },
};
export class UserController {
  constructor(
    @inject('datasources.charityxchangeSql')
    public dataSource: CharityxchangeSqlDataSource,
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject('service.hasher')
    public hasher: BcryptHasher,
    @inject('service.user.service')
    public userService: MyUserService,
    @inject('service.jwt.service')
    public jwtService: JWTService,
    @inject('service.transaction.service')
    public transactionService: TransactionService,
    @inject(EmailManagerBindings.SEND_MAIL)
    public emailManager: EmailManager,
    @repository(UserPricingPlanRepository)
    public userPricingPlanRepository: UserPricingPlanRepository,
    @repository(PricingPlanRepository)
    public pricingPlanRepository: PricingPlanRepository,
    @repository(UserLinksRepository)
    protected userLinksRepository: UserLinksRepository,
  ) {}

  @post('/users/register', {
    responses: {
      '200': {
        description: 'User',
        content: {
          schema: getJsonSchemaRef(User),
        },
      },
    },
  })
  async register(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            exclude: ['id'],
          }),
        },
      },
    })
    userData: Omit<User, 'id'>,
  ) {
    const user = await this.userRepository.findOne({
      where: {
        email: userData.email,
      },
    });
    if (user) {
      throw new HttpErrors.BadRequest('Email Already Exists');
    }
    validateCredentials(_.pick(userData, ['email', 'password']));
    userData.permissions = [PermissionKeys.EMPLOYEE];
    const decryptedPassword = userData.password;
    userData.password = await this.hasher.hashPassword(userData.password);
    const savedUser = await this.userRepository.create(userData);
    const savedUserData = _.omit(savedUser, 'password');
    const useProfileData: any = {
      userId: savedUserData.id,
    };
    await this.userRepository
      .userProfile(savedUserData.id)
      .create(useProfileData);
    await this.userRepository
      .balance_user(savedUserData.id)
      .create(useProfileData);
    const template = generateEmailAndPasswordTemplate({
      ...userData,
      password: decryptedPassword,
    });

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
        // throw new HttpErrors.UnprocessableEntity(err);
      });
    return data;
  }

  @post('/users/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{}> {
    let user = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);
    const userData = _.omit(user, 'password');
    const token = await this.jwtService.generateToken(userProfile);
    return Promise.resolve({
      token: token,
      user: userData,
    });
  }

  @get('/users/me')
  @authenticate('jwt')
  async whoAmI(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
  ): Promise<{}> {
    const user = await this.userRepository.findOne({
      where: {
        id: currnetUser.id,
      },
      include: [
        {relation: 'userProfile'},
        {relation: 'balance_user'},
        {relation: 'adminBalances'},
        {
          relation: 'transactions',
          scope: {
            order: ['id DESC'], // Sort by transactions' property in ascending order
          },
        },
      ],
    });

    const currentUserActivePlan =
      await this.userService.getCurrentUserActivePack(currnetUser);
    const userLevel = await this.userService.calculateUserLevel(currnetUser);
    return Promise.resolve({
      ...user,
      activePayment:
        Object.keys(currentUserActivePlan).length > 0
          ? currentUserActivePlan
          : undefined,
      userLevel: userLevel,
    });
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.EMPLOYEE]},
  })
  @get('/users')
  @response(200, {
    description: 'Array of Users model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(User) filter?: Filter<User>): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  @post('/sendOtp')
  async sendOtp(
    @requestBody({})
    userData: any,
  ): Promise<object> {
    const otp = Math.floor(1000 + Math.random() * 9000);
    const template = generateOtpTemplate({...userData, otp: otp || '0000'});
    const user = await this.userRepository.findOne({
      where: {
        email: userData.email,
      },
    });
    if (user) {
      var now = new Date();
      this.userRepository.updateById(user.id, {
        otp: `${otp}`,
        otp_expire_at: `${this.AddMinutesToDate(now, 10)}`,
      });
    } else {
      throw new HttpErrors.BadRequest("Email Doesn't Exists");
    }
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
          message: `Successfully sent otp mail to ${userData.email}`,
        });
      })
      .catch(function (err: any) {
        throw new HttpErrors.UnprocessableEntity(err);
      });
    return Promise.resolve({
      success: true,
      message: `Successfully sent otp mail to ${userData.email}`,
    });
  }

  @post('/verifyOtp')
  async verifyOtp(
    @requestBody({})
    otpOptions: any,
  ): Promise<object> {
    const user = await this.userRepository.findOne({
      where: {
        email: otpOptions.email,
      },
    });
    if (user) {
      var now = new Date();
      var expire_date = new Date(user.otp_expire_at);
      if (now <= expire_date && otpOptions.otp === user.otp) {
        return {
          success: true,
          message: 'otp verification successfull',
        };
      } else {
        return {
          success: false,
          error: 'otp verification failed',
        };
      }
    } else {
      throw new HttpErrors.BadRequest("Email Doesn't Exists");
    }
  }

  AddMinutesToDate(date: any, minutes: any) {
    return new Date(date.getTime() + minutes * 60000);
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @get('/users/{id}', {
    responses: {
      '200': {
        description: 'User Details',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User),
          },
        },
      },
    },
  })
  async getSingleUser(@param.path.number('id') id: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
      include: ['userProfile', 'balance_user'],
    });
    return Promise.resolve({
      ...user,
    });
  }

  @authenticate('jwt')
  @post('/user/subscribe', {
    responses: {
      '200': {
        description: 'Subscription',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: {
                  type: 'string',
                },
                message: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async subscribeToPlan(
    @requestBody(PackageSubscriptionRequestBody) pricingPlan: any,
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
  ): Promise<{}> {
    const repo = new DefaultTransactionalRepository(User, this.dataSource);
    const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
    try {
      const currentBalanceOfUser = await this.userRepository
        .balance_user(currnetUser.id)
        .get();
      if (
        currentBalanceOfUser &&
        currentBalanceOfUser.current_balance < pricingPlan.price
      ) {
        console.log('here');
        throw new HttpErrors[400]('Not Enough Balance');
      }

      const currentUserActivePlans = await this.userPricingPlanRepository.find({
        where: {
          userId: currnetUser.id,
        },
      });
      let filteredData = currentUserActivePlans;
      let currentUserActivePlan;
      if (currentUserActivePlans.length > 0) {
        filteredData = currentUserActivePlans.filter(function (res) {
          return res.is_active === true;
        });

        if (filteredData.length > 1) {
          throw new HttpErrors[400]('User Has More than one active plans');
        }
        currentUserActivePlan = filteredData[0];
      }

      if (currentUserActivePlan?.pricingPlanId == pricingPlan.id) {
        throw new HttpErrors[400]('Plan is already active');
      }

      await this.userRepository.balance_user(currnetUser.id).patch(
        {
          current_balance:
            currentBalanceOfUser.current_balance - pricingPlan.price,
          chxtToken:
            CHXT_COUNT[pricingPlan.total_links as keyof typeof CHXT_COUNT],
        },
        {transaction: tx},
      );
      const adminBalance = await this.userRepository
        .adminBalances(ADMIN_ID)
        .get();
      const plansDistibution =
        USERLINKACTIVEANDHELPSEND[
          pricingPlan.total_links as keyof typeof USERLINKACTIVEANDHELPSEND
        ];
      await this.userRepository.adminBalances(ADMIN_ID).patch(
        {
          activation_help:
            adminBalance.activation_help + plansDistibution.active,
          total_help_received:
            adminBalance.total_help_received + plansDistibution.sendHelp,
          total_earnings: adminBalance.total_earnings + pricingPlan.price,
        },
        {transaction: tx},
      );

      let previousLinkCount = 0;
      let currentActivePlanData;
      if (currentUserActivePlan) {
        previousLinkCount = await (
          await this.userRepository.userLinks(currnetUser.id).find()
        ).length;
        currentActivePlanData = await this.pricingPlanRepository.findById(
          currentUserActivePlan?.pricingPlanId,
        );
        await this.userPricingPlanRepository.updateById(
          currentUserActivePlan?.id,
          {
            ...currentUserActivePlan,
            is_active: false,
          },
          {transaction: tx},
        );
        pricingPlan.total_links =
          pricingPlan.total_links - currentActivePlanData.total_links;
      }

      const pricingPlanData: any = {
        userId: currnetUser.id,
        pricingPlanId: pricingPlan.id,
        startDate: new Date().toString(),
        endDate: new Date(Date.UTC(2099, 1, 13, 23, 31, 30)).toString(),
        is_active: true,
      };
      await this.userPricingPlanRepository.create(pricingPlanData, {
        transaction: tx,
      });

      for (let i = 0; i < pricingPlan.total_links; i++) {
        const userLinkData = {
          linkName: currnetUser.name
            ? `${currnetUser?.id}-` + (previousLinkCount + i + 1)
            : `${new Date()}`,
          is_active: true,
          is_help_send: true,
          is_help_received: false,
          is_send_to_admin: this.calculateBasedOnTotalLink(
            pricingPlan.total_links,
            i,
          ),
        };

        const userLink = await this.userRepository
          .userLinks(currnetUser.id)
          .create(userLinkData, {transaction: tx});
        if (userLinkData.is_send_to_admin) {
          const updatedUserLinkData = omit(userLinkData, 'is_help_received');

          await this.userLinksRepository
            .adminReceivedLinks(userLink.id)
            .create(
              {...updatedUserLinkData, is_help_send_to_user: false},
              {transaction: tx},
            );
        }
      }
      const transactionDetails: any = {
        transaction_id: generateTransactionId(),
        remark: 'Plan Activation',
        amount: pricingPlan.price,
        type: 'Debited',
        status: true,
        transaction_fees: 0,
        transaction_type: TRANSACTION_TYPES.PRICING_PlAN,
      };
      await this.transactionService.createTransaction(
        transactionDetails,
        currnetUser.id,
      );
      tx.commit();
      return Promise.resolve({
        success: true,
        message: 'Successfully Subscribed to a Plan',
      });
    } catch (err) {
      tx.rollback();
      throw err;
    }
  }

  calculateBasedOnTotalLink(total_links: any, index: number): boolean {
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

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.EMPLOYEE]},
  })
  @get('/getAllDescendantsOfUser')
  async getAllDescendantsOfUser(
    @inject(AuthenticationBindings.CURRENT_USER) currnetUser: UserProfile,
  ): Promise<any> {
    return this.userRepository.execute(`WITH RECURSIVE descendants AS (
      SELECT u.id , u.name, u.email, u.is_active, u.createdAt, u.cycles_participated,u.parent_id,u.permissions,
             json_object(
               'id',b.id,
               'total_earnings', b.total_earnings,
               'withdrawn_amount', b.withdrawn_amount, 
               'current_balance', b.current_balance, 
               'createdAt', b.createdAt,
               'updated_at', b.updatedAt,
               'user_id', b.userId,
               'payment_info', b.payment_info,
               'is_first_level_price_taken', b.is_first_level_price_taken,
               'chxtToken', b.chxtToken
             ) AS balance_user
      FROM user u
      JOIN balances b ON u.id = b.userId
      WHERE u.id = ${currnetUser.id}
      UNION ALL
      SELECT u.id, u.name, u.email, u.is_active, u.createdAt,u.cycles_participated,u.parent_id,u.permissions,
             json_object(
               'id', b.id,
               'total_earnings', b.total_earnings,
               'withdrawn_amount', b.withdrawn_amount, 
               'current_balance', b.current_balance, 
               'createdAt', b.createdAt,
               'updated_at', b.updatedAt,
               'user_id', b.userId,
               'payment_info', b.payment_info,
               'is_first_level_price_taken', b.is_first_level_price_taken,
               'chxtToken', b.chxtToken
             ) AS balance_user
      FROM user u
      JOIN descendants d ON u.parent_id = d.id
      JOIN balances b ON u.id = b.userId
    )
    SELECT *
    FROM descendants;`);
  }

  @post('/updateResetKey')
  async updateResetKey(
    @requestBody({})
    userData: any,
  ): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        email: userData.email,
      },
    });
    const chars =
      '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const length = 40;
    let resetKey = '';

    for (let i = 0; i < length; i++) {
      resetKey += chars[Math.floor(Math.random() * chars.length)];
    }
    if (user) {
      var now = new Date();
      await this.userRepository.updateById(user.id, {
        resetKey: `${resetKey}`,
        resetKey_expire_at: `${this.AddMinutesToDate(now, 10)}`,
      });
      return Promise.resolve({
        success: true,
        message: `Key Reset Successfully`,
        key: `${resetKey}`,
      });
    } else {
      throw new HttpErrors.BadRequest("Email Doesn't Exists");
    }
  }

  @post('/resetPassword/{key}')
  async resetPassword(
    @requestBody({})
    @param.path.string('key')
    key: typeof User.prototype.resetKey,
    passwordData: any,
  ): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        resetKey: key,
      },
    });
    if (user) {
      var now = new Date();
      var expire_date = new Date(user.resetKey_expire_at);
      if (now <= expire_date && key === user.resetKey) {
        const newPassword = await this.hasher.hashPassword(
          passwordData.password,
        );
        await this.userRepository.updateById(user.id, {
          password: newPassword,
        });
      } else {
        throw new HttpErrors.BadRequest('Reset key is invalid or expired');
      }
      return Promise.resolve({
        success: true,
        message: `Password Updated Successfully`,
      });
    } else {
      throw new HttpErrors.BadRequest('Reset key is invalid or expired');
    }
  }
}
