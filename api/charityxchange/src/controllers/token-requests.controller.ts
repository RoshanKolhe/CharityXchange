import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {PermissionKeys} from '../authorization/permission-keys';
import {TokenRequests, UserProfile} from '../models';
import {TokenRequestsRepository, UserRepository} from '../repositories';

export class TokenRequestsController {
  constructor(
    @repository(TokenRequestsRepository)
    public tokenRequestsRepository: TokenRequestsRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  @post('/token-requests')
  @authenticate('jwt')
  @response(200, {
    description: 'TokenRequests model instance',
    content: {'application/json': {schema: getModelSchemaRef(TokenRequests)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TokenRequests, {
            title: 'NewTokenRequests',
            exclude: ['id'],
          }),
        },
      },
    })
    tokenRequests: Omit<TokenRequests, 'id'>,
  ): Promise<TokenRequests> {
    return this.tokenRequestsRepository.create(tokenRequests);
  }

  @get('/token-requests/count')
  @authenticate('jwt')
  @response(200, {
    description: 'TokenRequests model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(TokenRequests) where?: Where<TokenRequests>,
  ): Promise<Count> {
    return this.tokenRequestsRepository.count(where);
  }

  @get('/token-requests')
  @authenticate('jwt')
  @response(200, {
    description: 'Array of TokenRequests model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(TokenRequests, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(TokenRequests) filter?: Filter<TokenRequests>,
  ): Promise<TokenRequests[]> {
    return this.tokenRequestsRepository.find(filter);
  }

  @patch('/token-requests')
  @authenticate('jwt')
  @response(200, {
    description: 'TokenRequests PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TokenRequests, {partial: true}),
        },
      },
    })
    tokenRequests: TokenRequests,
    @param.where(TokenRequests) where?: Where<TokenRequests>,
  ): Promise<Count> {
    return this.tokenRequestsRepository.updateAll(tokenRequests, where);
  }

  @get('/token-requests/{id}')
  @authenticate('jwt')
  @response(200, {
    description: 'TokenRequests model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(TokenRequests, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(TokenRequests, {exclude: 'where'})
    filter?: FilterExcludingWhere<TokenRequests>,
  ): Promise<TokenRequests> {
    return this.tokenRequestsRepository.findById(id, filter);
  }

  @patch('/token-requests/{id}')
  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @response(204, {
    description: 'TokenRequests PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TokenRequests, {partial: true}),
        },
      },
    })
    tokenRequests: TokenRequests,
  ): Promise<any> {
    try {
      await this.tokenRequestsRepository.updateById(id, tokenRequests);
      const current_balance =
        (await (
          await this.userRepository.balance_user(tokenRequests.userId).get()
        ).current_balance) || 0;
      const amountToBeAdded = tokenRequests.amount || 0;

      //Add Token to users account
      const inputData = {
        current_balance: current_balance + amountToBeAdded,
      };
      await this.userRepository
        .balance_user(tokenRequests.userId)
        .patch(inputData);
      //subtract token from admins account
      const admin_total_supply =
        (await (
          await this.userRepository.adminBalances(5).get()
        ).total_supply) || 0;
      const dataToSubtract = {
        total_supply: admin_total_supply - amountToBeAdded,
      };
      return await this.userRepository.adminBalances(5).patch(dataToSubtract);
    } catch (err) {
      throw new HttpErrors[400](err);
    }
  }

  @put('/token-requests/{id}')
  @authenticate('jwt')
  @response(204, {
    description: 'TokenRequests PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() tokenRequests: TokenRequests,
  ): Promise<void> {
    await this.tokenRequestsRepository.replaceById(id, tokenRequests);
  }

  @del('/token-requests/{id}')
  @authenticate('jwt')
  @response(204, {
    description: 'TokenRequests DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.tokenRequestsRepository.deleteById(id);
  }

  @patch('/token-requests-update-selcted')
  @authenticate('jwt')
  @response(200, {
    description: 'TokenRequests PATCH success count',
  })
  async updateSelected(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TokenRequests, {partial: true}),
        },
      },
    })
    tokenRequests: TokenRequests,
    @param.where(TokenRequests) where?: Where<TokenRequests>,
  ): Promise<{}> {
    return this.tokenRequestsRepository.updateAll(tokenRequests, where);
  }
}
