import { Credentials } from './../repositories/user.repository';
import * as isEmail from 'isemail';
import {HttpErrors} from '@loopback/rest';

export function validateCredentials(credentials :Credentials){
  if(!isEmail.validate(credentials.email)){
    throw new HttpErrors.UnprocessableEntity('invalid email');
  }

  if(credentials.password.length < 6){
    throw new HttpErrors.UnprocessableEntity('password length should be greater than 8');
  }
}
