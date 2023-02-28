import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Cycles,
  CyclePayments,
} from '../models';
import {CyclesRepository} from '../repositories';

export class CyclesCyclePaymentsController {
  constructor(
    @repository(CyclesRepository) protected cyclesRepository: CyclesRepository,
  ) { }

  @get('/cycles/{id}/cycle-payments', {
    responses: {
      '200': {
        description: 'Array of Cycles has many CyclePayments',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(CyclePayments)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<CyclePayments>,
  ): Promise<CyclePayments[]> {
    return this.cyclesRepository.cyclePayments(id).find(filter);
  }

  @post('/cycles/{id}/cycle-payments', {
    responses: {
      '200': {
        description: 'Cycles model instance',
        content: {'application/json': {schema: getModelSchemaRef(CyclePayments)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Cycles.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CyclePayments, {
            title: 'NewCyclePaymentsInCycles',
            exclude: ['id'],
            optional: ['cyclesId']
          }),
        },
      },
    }) cyclePayments: Omit<CyclePayments, 'id'>,
  ): Promise<CyclePayments> {
    return this.cyclesRepository.cyclePayments(id).create(cyclePayments);
  }

  @patch('/cycles/{id}/cycle-payments', {
    responses: {
      '200': {
        description: 'Cycles.CyclePayments PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CyclePayments, {partial: true}),
        },
      },
    })
    cyclePayments: Partial<CyclePayments>,
    @param.query.object('where', getWhereSchemaFor(CyclePayments)) where?: Where<CyclePayments>,
  ): Promise<Count> {
    return this.cyclesRepository.cyclePayments(id).patch(cyclePayments, where);
  }

  @del('/cycles/{id}/cycle-payments', {
    responses: {
      '200': {
        description: 'Cycles.CyclePayments DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(CyclePayments)) where?: Where<CyclePayments>,
  ): Promise<Count> {
    return this.cyclesRepository.cyclePayments(id).delete(where);
  }
}
