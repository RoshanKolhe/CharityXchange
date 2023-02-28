import {AuthenticationBindings, UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {DefaultTransactionalRepository, repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {Cycles, PricingPlan, User, UserPricingPlan} from '../models';
import {
  CyclesRepository,
  PricingPlanRepository,
  UserPricingPlanRepository,
} from '../repositories';
import {getUserLevel} from '../utils/constants';
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
    @repository(CyclesRepository)
    public cyclesRepository: CyclesRepository,
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

    if (!getUser.is_active) {
      throw new HttpErrors.BadRequest('User not active');
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

  async getCurrentUserActivePack(currnetUser: any): Promise<any> {
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

  async calculateUserLevel(currnetUser: any, cycle?: Cycles): Promise<any> {
    try {
      const descendantsOfuser: any = await this.userRepository
        .execute(`WITH RECURSIVE descendants AS (
        SELECT *
        FROM user
        WHERE id = ${currnetUser.id}
        UNION ALL
        SELECT user.*
        FROM user
        JOIN descendants ON user.parent_id = descendants.id
      )
      SELECT * FROM descendants;`);
      let currentCycle;
      if (!cycle) {
        const allCycles = await this.cyclesRepository.find();
        const currentDate = new Date();
        if (allCycles.length) {
          for (const cycle of allCycles) {
            const startDate = new Date(cycle.startDate);
            const endDate = new Date(cycle.endDate);
            if (currentDate >= startDate && currentDate <= endDate) {
              currentCycle = cycle;
            }
          }
        }
      } else {
        currentCycle = cycle;
      }
      let teamActiveLinkCount = 0;
      let directUserCount = 0;
      for (const descendant of descendantsOfuser) {
        const descendantUserWithLinks = await this.userRepository.findOne({
          where: {
            id: descendant.id,
          },
          include: ['userProfile', 'balance_user', 'userLinks'],
        });

        if (
          descendantUserWithLinks &&
          descendantUserWithLinks.userLinks &&
          descendantUserWithLinks.userLinks.length > 0
        ) {
          let filteredDescendantUserWithLinks = [];
          for (const link of descendantUserWithLinks.userLinks) {
            if (
              link.is_active ||
              (!link.is_active &&
                link.activationEndTime &&
                link.activationStartTime &&
                new Date() <= new Date(link.activationEndTime) &&
                new Date() >= new Date(link.activationStartTime))
            ) {
              if (
                link.createdAt &&
                currentCycle &&
                new Date(link.createdAt) >= new Date(currentCycle.startDate) &&
                new Date(link.createdAt) <= new Date(currentCycle.endDate)
              ) {
                filteredDescendantUserWithLinks.push(link);
              }
            }
          }
          teamActiveLinkCount =
            teamActiveLinkCount + filteredDescendantUserWithLinks.length;
        }
      }
      const userDirectUsers = await this.userRepository.find({
        where: {
          parent_id: currnetUser.id,
        },
      });
      for (const userDirectUser of userDirectUsers) {
        const userActivePlan = await this.getCurrentUserActivePack(
          userDirectUser,
        );
        if (userActivePlan && userActivePlan.total_links === 11) {
          directUserCount = directUserCount + 1;
        }
      }

      return {
        level: getUserLevel(directUserCount, teamActiveLinkCount),
        directUserCount: directUserCount,
        teamActiveLinkCount: teamActiveLinkCount,
      };
    } catch (err) {
      console.log(err);
    }
  }
}
