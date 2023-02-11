import {AuthenticationBindings, UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {DefaultTransactionalRepository, repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {PricingPlan, User, UserPricingPlan} from '../models';
import {
  PricingPlanRepository,
  UserPricingPlanRepository,
} from '../repositories';
import {Credentials, UserRepository} from './../repositories/user.repository';
import {BcryptHasher} from './hash.password.bcrypt';

export class MyUserService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject('service.hasher')
    public hasher: BcryptHasher,
    @repository(UserPricingPlanRepository)
    public userPricingPlanRepository: UserPricingPlanRepository,
    @repository(PricingPlanRepository)
    public pricingPlanRepository: PricingPlanRepository,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<User> {
    const getUser = await this.userRepository.findOne({
      where: {
        email: credentials.email,
      },
    });
    if (!getUser) {
      throw new HttpErrors.BadRequest('Email not found');
    }

    const passswordCheck = await this.hasher.comparePassword(
      credentials.password,
      getUser.password,
    );
    if (passswordCheck) {
      return getUser;
    }
    throw new HttpErrors.BadRequest('password doesnt match');
  }

  convertToUserProfile(user: User): UserProfile {
    return {
      id: `${user.id}`,
      name: `${user.name}`,
      email: user.email,
      [securityId]: `${user.id}`,
      permissions: user.permissions,
    };
  }

  async getCurrentUserActivePack(
    currnetUser: UserProfile,
  ): Promise<any> {
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
        throw new HttpErrors[400]('Something went wrong');
      }
      currentUserActivePlan = filteredData[0];
    } else {
      currentUserActivePlan = {};
    }
    let currentActivePack;
    if (Object.keys(currentUserActivePlan).length) {
      currentActivePack = await this.pricingPlanRepository.findById(
        currentUserActivePlan.pricingPlanId,
      );
      return currentActivePack;
    } else {
      return currentUserActivePlan;
    }
  }
}
