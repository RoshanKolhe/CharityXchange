import {authenticate} from '@loopback/authentication';
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
import { PermissionKeys } from '../authorization/permission-keys';
import {AdminBalances} from '../models';
import {AdminBalancesRepository} from '../repositories';

export class AdminBalancesController {
  constructor(
    @repository(AdminBalancesRepository)
    public adminBalancesRepository: AdminBalancesRepository,
  ) {}

  @authenticate({
    strategy: 'jwt',
    options: {required: [PermissionKeys.SUPER_ADMIN]},
  })
  @get('/admin-balances/count')
  @response(200, {
    description: 'AdminBalances model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(AdminBalances) where?: Where<AdminBalances>,
  ): Promise<Count> {
    return this.adminBalancesRepository.count(where);
  }

  @get('/admin-balances/{id}')
  @authenticate('jwt')
  @response(200, {
    description: 'AdminBalances model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(AdminBalances, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(AdminBalances, {exclude: 'where'})
    filter?: FilterExcludingWhere<AdminBalances>,
  ): Promise<AdminBalances> {
    return this.adminBalancesRepository.findById(id, filter);
  }
}
