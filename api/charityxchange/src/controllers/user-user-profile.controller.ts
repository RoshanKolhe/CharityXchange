import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
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
  RequestContext,
  RestBindings,
} from '@loopback/rest';
import {omit, pick} from 'lodash';
import {EmailManagerBindings} from '../keys';
import {User, UserProfile} from '../models';
import {BalancesRepository, UserRepository} from '../repositories';
import {EmailManager} from '../services/email.service';
import generateKycDeclineTemplate from '../templates/kyc-decline.template';
import SITE_SETTINGS from '../utils/config';

export class UserUserProfileController {
  constructor(
    @repository(BalancesRepository)
    protected balanceRepository: BalancesRepository,
    @repository(UserRepository)
    protected userRepository: UserRepository,
    @inject(EmailManagerBindings.SEND_MAIL)
    public emailManager: EmailManager,
  ) {}

  @get('/users/{id}/user-profile', {
    responses: {
      '200': {
        description: 'User has one UserProfile',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UserProfile),
          },
        },
      },
    },
  })
  @authenticate('jwt')
  async get(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<UserProfile>,
  ): Promise<UserProfile> {
    return this.userRepository.userProfile(id).get(filter);
  }

  @post('/users/{id}/user-profile', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(UserProfile)}},
      },
    },
  })
  @authenticate('jwt')
  async create(
    @param.path.number('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserProfile, {
            title: 'NewUserProfileInUser',
            exclude: ['id'],
            optional: ['userId'],
          }),
        },
      },
    })
    userProfile: Omit<UserProfile, 'id'>,
  ): Promise<UserProfile> {
    return this.userRepository.userProfile(id).create(userProfile);
  }

  @patch('/users/{id}/user-profile')
  @authenticate('jwt')
  async patch(
    @param.path.number('id') id: number,
    @requestBody({})
    userProfile: any,
  ): Promise<{}> {
    try {
      const userProfilePoccessabelData = userProfile;
      await this.userRepository.updateById(
        id,
        omit(userProfile, 'userProfile'),
      );

      if (userProfilePoccessabelData.userProfile.hasOwnProperty('id')) {
        await this.userRepository
          .userProfile(id)
          .patch(userProfilePoccessabelData.userProfile);
      } else {
        const data = await this.userRepository
          .userProfile(id)
          .get()
          .catch(res => {
            console.log(res);
          });

        if (!data) {
          await this.userRepository
            .userProfile(id)
            .create(userProfilePoccessabelData.userProfile);
        } else {
          await this.userRepository
            .userProfile(id)
            .patch(userProfilePoccessabelData.userProfile);
        }
      }

      if (userProfilePoccessabelData.balances.hasOwnProperty('id')) {
        await this.userRepository
          .balance_user(id)
          .patch(userProfilePoccessabelData.balances);
      } else {
        const data = await this.userRepository
          .balance_user(id)
          .get()
          .catch(res => {
            console.log(res);
          });

        if (!data) {
          await this.userRepository
            .balance_user(id)
            .create(userProfilePoccessabelData.balances);
        } else {
          await this.userRepository
            .balance_user(id)
            .patch(userProfilePoccessabelData.balances);
        }
      }

      return Promise.resolve({
        ...userProfile,
      });
    } catch (err) {
      throw new HttpErrors.UnprocessableEntity(`error updatin profile${err}`);
    }
  }

  @patch('/approveDisapproveKyc')
  @authenticate('jwt')
  async approveOrDisapproveUserKyc(
    @requestBody({})
    userProfile: any,
  ): Promise<any> {
    try {
      await this.userRepository.updateById(
        userProfile.id,
        omit(userProfile, 'userProfile'),
      );
      if (userProfile.is_kyc_completed === 3) {
        const template = generateKycDeclineTemplate({
          ...userProfile,
        });

        const mailOptions = {
          from: SITE_SETTINGS.fromMail,
          to: userProfile.email,
          subject: template.subject,
          html: template.html,
        };
        this.emailManager
          .sendMail(mailOptions)
          .then(function (res: any) {
            return Promise.resolve({
              success: true,
              message: `Kyc Declined Mail sent successfully`,
            });
          })
          .catch(function (err: any) {
            throw new HttpErrors.UnprocessableEntity(err);
          });
      }

      return Promise.resolve(userProfile);
    } catch (err) {
      throw new HttpErrors.UnprocessableEntity(`error updatin profile${err}`);
    }
  }

  @del('/users/{id}/user-profile', {
    responses: {
      '200': {
        description: 'User.UserProfile DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(UserProfile))
    where?: Where<UserProfile>,
  ): Promise<Count> {
    return this.userRepository.userProfile(id).delete(where);
  }

  @post('/checkIfWalletAddressExists')
  async checkIfWalletAddressExists(@requestBody() keyData: any): Promise<any> {
    console.log(keyData);
    const records = await this.balanceRepository.execute(
      `select * from Balances where payment_info like '%{"wallet_address":"${keyData.wallet_address}"}%';`,
    );
    console.log('records', records);
    if (records.length > 0) {
      return Promise.resolve({
        success: true,
        message: 'This address already exists',
      });
    }
    return Promise.resolve({
      success: false,
      message: 'This address does not exists',
    });
  }
}
