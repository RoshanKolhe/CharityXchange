// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import * as _ from 'lodash';
import {
  getJsonSchemaRef,
  getModelSchemaRef,
  HttpErrors,
  post,
  requestBody,
} from '@loopback/rest';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {BcryptHasher} from '../services/hash.password.bcrypt';
import {validateCredentials} from '../services/validator';
import {PermissionKeys} from '../authorization/permission-keys';

// import {inject} from '@loopback/core';

export class AdminController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject('service.hasher')
    public hasher: BcryptHasher,
  ) {}

  @post('/admin', {
    responses: {
      '200': {
        description: 'Admin',
        content: {
          schema: getJsonSchemaRef(User),
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            exclude: ['id'],
          }),
        },
      },
    })
    adminData: Omit<User, 'id'>,
  ) {
    const user = await this.userRepository.findOne({
      where: {
        email: adminData.email,
      },
    });
    if (user) {
      throw new HttpErrors.BadRequest('Email Already Exists');
    }
    validateCredentials(_.pick(adminData, ['email', 'password']));
    adminData.permissions = [
      PermissionKeys.SUPER_ADMIN,
      PermissionKeys.EMPLOYEE,
    ];
    adminData.password = await this.hasher.hashPassword(adminData.password);
    const savedUser = await this.userRepository.create(adminData);
    const savedUserData = _.omit(savedUser, 'password');
    const useProfileData: any = {
      userId: savedUserData.id,
    };
    const adminBalancesData: any = {
      adminId: savedUserData.id,
    };
    await this.userRepository
      .userProfile(savedUserData.id)
      .create(useProfileData);
    await this.userRepository
      .adminBalances(savedUserData.id)
      .create(adminBalancesData);
    return savedUserData;
  }
}
