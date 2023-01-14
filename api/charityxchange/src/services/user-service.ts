import {UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {User} from '../models';
import {Credentials, UserRepository} from './../repositories/user.repository';
import {BcryptHasher} from './hash.password.bcrypt';

export class MyUserService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject('service.hasher')
    public hasher: BcryptHasher,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const getUser = await this.userRepository.findOne({
      where: {
        email: credentials.email,
      },
    });
    if (!getUser) {
      throw new HttpErrors.NotFound('Email not found');
    }

    const passswordCheck = await this.hasher.comparePassword(
      credentials.password,
      getUser.password,
    );
    if (passswordCheck) {
      return getUser;
    }
    throw new HttpErrors.Unauthorized('password doesnt match');
  }

  convertToUserProfile(user: User): UserProfile {
    return {
      id: `${user.id}`,
      name: `${user.name}`,
      email: user.email,
      [securityId]: `${user.id}`,
    };
  }
}
