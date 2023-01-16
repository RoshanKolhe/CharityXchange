import {securityId, UserProfile} from '@loopback/security';
import {Filter, repository} from '@loopback/repository';
import {get, getJsonSchemaRef, getModelSchemaRef, param, post, requestBody, response} from '@loopback/rest';
import {User} from '../models';
import {Credentials, UserRepository} from '../repositories';
import * as _ from 'lodash';
import { validateCredentials } from '../services/validator';
import { inject } from '@loopback/core';
import { BcryptHasher } from '../services/hash.password.bcrypt';
import { CredentialsRequestBody } from './specs/user-controller-spec';
import { MyUserService } from '../services/user-service';
import { JWTService } from '../services/jwt-service';
import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { PermissionKeys } from '../authorization/permission-keys';

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
    validateCredentials(_.pick(userData, ['email', 'password']));
    userData.permissions = [PermissionKeys.EMPLOYEE];
    userData.password = await this.hasher.hashPassword(userData.password);
    const savedUser = await this.userRepository.create(userData);
    const savedUserData = _.omit(savedUser, 'password')
    return savedUserData;
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
    const userData = _.omit(user, 'password')
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
  ): Promise<UserProfile> {
    return Promise.resolve({
      id: currnetUser.id,
      name: currnetUser.name,
      [securityId]: currnetUser.id,
    });
  }
  @authenticate({strategy: 'jwt', options: {required: [PermissionKeys.SUPER_ADMIN]}})
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
}
