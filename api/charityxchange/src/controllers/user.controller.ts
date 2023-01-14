// Uncomment these imports to begin using these cool features!

import {repository} from '@loopback/repository';
import {getJsonSchemaRef, getModelSchemaRef, post, requestBody, response} from '@loopback/rest';
import {User} from '../models';
import {Credentials, UserRepository} from '../repositories';
import * as _ from 'lodash';
import { validateCredentials } from '../services/validator';
import { inject } from '@loopback/core';
import { BcryptHasher } from '../services/hash.password.bcrypt';
import { CredentialsRequestBody } from './specs/user-controller-spec';
import { MyUserService } from '../services/user-service';
import { JWTService } from '../services/jwt-service';

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
}
