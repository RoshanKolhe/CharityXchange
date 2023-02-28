import {Entity, hasOne, model, property, hasMany} from '@loopback/repository';
import {UserProfile, UserProfileWithRelations} from './user-profile.model';
import {Balances} from './balances.model';
import {AdminBalances} from './admin-balances.model';
import {TokenRequests} from './token-requests.model';
import {UserLinks} from './user-links.model';
import {Transactions} from './transactions.model';

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
    type: 'number',
    required: true,
    default: 0,
  })
  is_kyc_completed: number;

  @property({
    type: 'number',
    default: 0,
  })
  cycles_participated: number;

  @property({
    type: 'string',
  })
  decline_reason?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  terms: boolean;

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

  @hasOne(() => AdminBalances, {keyTo: 'adminId'})
  adminBalances: AdminBalances;

  @hasMany(() => TokenRequests)
  tokenRequests: TokenRequests[];

  @hasMany(() => UserLinks)
  userLinks: UserLinks[];

  @hasMany(() => Transactions)
  transactions: Transactions[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
  userProfile?: UserProfileWithRelations;
}

export type UserWithRelations = User & UserRelations;
