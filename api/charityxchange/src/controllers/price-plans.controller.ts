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
import {PricingPlan} from '../models';
import {PricingPlanRepository} from '../repositories';

export class PricePlansController {
  constructor(
    @repository(PricingPlanRepository)
    public pricingPlanRepository : PricingPlanRepository,
  ) {}

  @post('/pricing-plans')
  @response(200, {
    description: 'PricingPlan model instance',
    content: {'application/json': {schema: getModelSchemaRef(PricingPlan)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PricingPlan, {
            title: 'NewPricingPlan',
            exclude: ['id'],
          }),
        },
      },
    })
    pricingPlan: Omit<PricingPlan, 'id'>,
  ): Promise<PricingPlan> {
    return this.pricingPlanRepository.create(pricingPlan);
  }

  @get('/pricing-plans/count')
  @response(200, {
    description: 'PricingPlan model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(PricingPlan) where?: Where<PricingPlan>,
  ): Promise<Count> {
    return this.pricingPlanRepository.count(where);
  }

  @get('/pricing-plans')
  @response(200, {
    description: 'Array of PricingPlan model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(PricingPlan, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(PricingPlan) filter?: Filter<PricingPlan>,
  ): Promise<PricingPlan[]> {
    return this.pricingPlanRepository.find(filter);
  }

  @patch('/pricing-plans')
  @response(200, {
    description: 'PricingPlan PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PricingPlan, {partial: true}),
        },
      },
    })
    pricingPlan: PricingPlan,
    @param.where(PricingPlan) where?: Where<PricingPlan>,
  ): Promise<Count> {
    return this.pricingPlanRepository.updateAll(pricingPlan, where);
  }

  @get('/pricing-plans/{id}')
  @response(200, {
    description: 'PricingPlan model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(PricingPlan, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(PricingPlan, {exclude: 'where'}) filter?: FilterExcludingWhere<PricingPlan>
  ): Promise<PricingPlan> {
    return this.pricingPlanRepository.findById(id, filter);
  }

  @patch('/pricing-plans/{id}')
  @response(204, {
    description: 'PricingPlan PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PricingPlan, {partial: true}),
        },
      },
    })
    pricingPlan: PricingPlan,
  ): Promise<void> {
    await this.pricingPlanRepository.updateById(id, pricingPlan);
  }

  @put('/pricing-plans/{id}')
  @response(204, {
    description: 'PricingPlan PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() pricingPlan: PricingPlan,
  ): Promise<void> {
    await this.pricingPlanRepository.replaceById(id, pricingPlan);
  }

  @del('/pricing-plans/{id}')
  @response(204, {
    description: 'PricingPlan DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.pricingPlanRepository.deleteById(id);
  }
}
