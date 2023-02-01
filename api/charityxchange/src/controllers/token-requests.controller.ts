import { authenticate } from '@loopback/authentication';
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
import {TokenRequests} from '../models';
import {TokenRequestsRepository} from '../repositories';

export class TokenRequestsController {
  constructor(
    @repository(TokenRequestsRepository)
    public tokenRequestsRepository : TokenRequestsRepository,
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
    @param.filter(TokenRequests, {exclude: 'where'}) filter?: FilterExcludingWhere<TokenRequests>
  ): Promise<TokenRequests> {
    return this.tokenRequestsRepository.findById(id, filter);
  }

  @patch('/token-requests/{id}')
  @authenticate('jwt')
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
  ): Promise<void> {
    await this.tokenRequestsRepository.updateById(id, tokenRequests);
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
}
