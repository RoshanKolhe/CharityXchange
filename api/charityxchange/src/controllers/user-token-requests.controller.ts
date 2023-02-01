import { authenticate } from '@loopback/authentication';
import {inject} from '@loopback/core';
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
  HttpErrors,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {EmailManagerBindings} from '../keys';
import {User, TokenRequests} from '../models';
import {UserRepository} from '../repositories';
import {EmailManager} from '../services/email.service';
import generatenotificationUserTokenTemplate from '../templates/notification-user-token-request.template';
import SITE_SETTINGS from '../utils/config';

export class UserTokenRequestsController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
    @inject(EmailManagerBindings.SEND_MAIL)
    public emailManager: EmailManager,
  ) {}

  @authenticate('jwt')
  @get('/users/{id}/token-requests', {
    responses: {
      '200': {
        description: 'Array of User has many TokenRequests',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(TokenRequests)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<TokenRequests>,
  ): Promise<TokenRequests[]> {
    return this.userRepository.tokenRequests(id).find(filter);
  }

  @authenticate('jwt')
  @post('/users/{id}/token-requests', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(TokenRequests)},
        },
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TokenRequests, {
            title: 'NewTokenRequestsInUser',
            exclude: ['id'],
            optional: ['userId'],
          }),
        },
      },
    })
    tokenRequests: Omit<TokenRequests, 'id'>,
  ): Promise<TokenRequests> {
    const template = generatenotificationUserTokenTemplate();
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
    if (!user) {
      throw new HttpErrors.BadRequest("User Doesn't exists");
    }
    const mailOptions = {
      from: SITE_SETTINGS.fromMail,
      to: user?.email,
      subject: template.subject,
      html: template.html,
    };
    // const data = await this.emailManager
    //   .sendMail(mailOptions)
    //   .then(function (res: any) {
    //     return Promise.resolve({
    //       success: true,
    //       message: `Token request confirmation mail sent to email ${user?.email} successfully`,
    //     });
    //   })
    //   .catch(function (err: any) {
    //     throw new HttpErrors.UnprocessableEntity(err);
    //   });
    return this.userRepository.tokenRequests(id).create(tokenRequests);
  }

  @authenticate('jwt')
  @patch('/users/{id}/token-requests', {
    responses: {
      '200': {
        description: 'User.TokenRequests PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(TokenRequests, {partial: true}),
        },
      },
    })
    tokenRequests: Partial<TokenRequests>,
    @param.query.object('where', getWhereSchemaFor(TokenRequests))
    where?: Where<TokenRequests>,
  ): Promise<Count> {
    return this.userRepository.tokenRequests(id).patch(tokenRequests, where);
  }

  @authenticate('jwt')
  @del('/users/{id}/token-requests', {
    responses: {
      '200': {
        description: 'User.TokenRequests DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(TokenRequests))
    where?: Where<TokenRequests>,
  ): Promise<Count> {
    return this.userRepository.tokenRequests(id).delete(where);
  }
}
