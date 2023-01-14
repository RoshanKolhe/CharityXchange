import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {promisify} from 'util';
const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);
export class JWTService {
  async generateToken(userProfile: UserProfile): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors.Unauthorized(
        'Error while generating token Userprofile is null',
      );
    }
    let token = '';
    try {
      token = await signAsync(userProfile, '213dfdsas', {
        expiresIn: '7h',
      });
    } catch (err) {
      throw new HttpErrors.Unauthorized(`error generating token${err}`);
    }
    return token;
  }

  async verifyToken(token: string): Promise<UserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized(
        "Error verifying token: 'token is null'",
      );
    }

    let userProfile: UserProfile;
    try {
      const decryptedToken = await verifyAsync(token, '213dfdsas');
      console.log(decryptedToken);
      userProfile = Object.assign(
        {id: '', name: '', [securityId]: ''},
        {
          id: decryptedToken.id,
          name: decryptedToken.name,
          [securityId]: decryptedToken.id,
        },
      );
    } catch (error) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token: ${error.message}`,
      );
    }

    return userProfile;
  }
}
