import {securityId, UserProfile} from '@loopback/security';
import {Filter, repository} from '@loopback/repository';
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
import {User, UserProfile as UserProfileData} from '../models';
import {Credentials, UserRepository} from '../repositories';
import * as _ from 'lodash';
import {validateCredentials} from '../services/validator';
import {inject} from '@loopback/core';
import {BcryptHasher} from '../services/hash.password.bcrypt';
import {CredentialsRequestBody} from './specs/user-controller-spec';
import {MyUserService} from '../services/user-service';
import {JWTService} from '../services/jwt-service';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {PermissionKeys} from '../authorization/permission-keys';
import {EmailManager} from '../services/email.service';
import {EmailManagerBindings} from '../keys';
import generateOtpTemplate from '../templates/otp.template';
import generateEmailAndPasswordTemplate from '../templates/email-and-password.template';

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
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject('service.hasher')
    public hasher: BcryptHasher,
    @inject('service.user.service')
    public userService: MyUserService,
    @inject('service.jwt.service')
    public jwtService: JWTService,
    @inject(EmailManagerBindings.SEND_MAIL)
    public emailManager: EmailManager,
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
        throw new HttpErrors.UnprocessableEntity(err);
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
      include: ['userProfile', 'balance_user'],
    });
    return Promise.resolve({
      ...user,
    });
  }

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
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
    return data;
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
}
