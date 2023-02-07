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
} from '@loopback/rest';
import {UserPricingPlan} from '../models';
import {UserPricingPlanRepository} from '../repositories';

export class UserPricingPlanController {
  constructor(
    @repository(UserPricingPlanRepository)
    public userPricingPlanRepository : UserPricingPlanRepository,
  ) {}

  @post('/user-pricing-plans')
  @response(200, {
    description: 'UserPricingPlan model instance',
    content: {'application/json': {schema: getModelSchemaRef(UserPricingPlan)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserPricingPlan, {
            title: 'NewUserPricingPlan',
            exclude: ['id'],
          }),
        },
      },
    })
    userPricingPlan: Omit<UserPricingPlan, 'id'>,
  ): Promise<UserPricingPlan> {
    return this.userPricingPlanRepository.create(userPricingPlan);
  }

  @get('/user-pricing-plans/count')
  @response(200, {
    description: 'UserPricingPlan model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(UserPricingPlan) where?: Where<UserPricingPlan>,
  ): Promise<Count> {
    return this.userPricingPlanRepository.count(where);
  }

  @get('/user-pricing-plans')
  @response(200, {
    description: 'Array of UserPricingPlan model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(UserPricingPlan, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(UserPricingPlan) filter?: Filter<UserPricingPlan>,
  ): Promise<UserPricingPlan[]> {
    return this.userPricingPlanRepository.find(filter);
  }

  @patch('/user-pricing-plans')
  @response(200, {
    description: 'UserPricingPlan PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserPricingPlan, {partial: true}),
        },
      },
    })
    userPricingPlan: UserPricingPlan,
    @param.where(UserPricingPlan) where?: Where<UserPricingPlan>,
  ): Promise<Count> {
    return this.userPricingPlanRepository.updateAll(userPricingPlan, where);
  }

  @get('/user-pricing-plans/{id}')
  @response(200, {
    description: 'UserPricingPlan model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(UserPricingPlan, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(UserPricingPlan, {exclude: 'where'}) filter?: FilterExcludingWhere<UserPricingPlan>
  ): Promise<UserPricingPlan> {
    return this.userPricingPlanRepository.findById(id, filter);
  }

  @patch('/user-pricing-plans/{id}')
  @response(204, {
    description: 'UserPricingPlan PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserPricingPlan, {partial: true}),
        },
      },
    })
    userPricingPlan: UserPricingPlan,
  ): Promise<void> {
    await this.userPricingPlanRepository.updateById(id, userPricingPlan);
  }

  @put('/user-pricing-plans/{id}')
  @response(204, {
    description: 'UserPricingPlan PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() userPricingPlan: UserPricingPlan,
  ): Promise<void> {
    await this.userPricingPlanRepository.replaceById(id, userPricingPlan);
  }

  @del('/user-pricing-plans/{id}')
  @response(204, {
    description: 'UserPricingPlan DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.userPricingPlanRepository.deleteById(id);
  }
}
