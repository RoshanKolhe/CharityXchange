import {Entity, hasOne, model, property} from '@loopback/repository';
import {UserProfile, UserProfileWithRelations} from './user-profile.model';
import {Balances} from './balances.model';

@model()
export class User extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
  })
  email_verified_at: string;

  @property.array(String, {
    name: 'permissions',
  })
  permissions: String[];

  @property({
    type: 'string',
  })
  remember_token?: string;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @property({
    type: 'boolean',
    required: true,
  })
  is_active: boolean;

  @property({
    type: 'boolean',
    required: true,
  })
  is_kyc_completed: boolean;

  @property({
    type: 'string',
  })
  otp?: string;

  @property({
    type: 'string',
  })
  otp_expire_at: string;

  @property({
    type: 'number',
  })
  parent_id?: number;

  @hasOne(() => UserProfile)
  userProfile: UserProfile;

  @hasOne(() => Balances)
  balance_user: Balances;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
  userProfile?: UserProfileWithRelations;
}

export type UserWithRelations = User & UserRelations;
