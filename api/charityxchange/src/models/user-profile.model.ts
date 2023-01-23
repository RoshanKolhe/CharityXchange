import {Entity, model, property, belongsTo} from '@loopback/repository';
import {User} from './user.model';

@model()
export class UserProfile extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'object',
  })
  avatar?: object;

  @property({
    type: 'string',
  })
  bio?: string;

  @property({
    type: 'string',
  })
  contact?: string;

  @property({
    type: 'date',
  })
  contact_verified_at?: string;

  @property({
    type: 'object',
  })
  address?: object;

  @property({
    type: 'object',
  })
  addreesProof?: object;

  @property({
    type: 'object',
  })
  idProof?: object;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @belongsTo(() => User)
  userId: number;

  constructor(data?: Partial<UserProfile>) {
    super(data);
  }
}

export interface UserProfileRelations {
  // describe navigational properties here
  user?: UserProfileWithRelations;
}

export type UserProfileWithRelations = UserProfile & UserProfileRelations;
