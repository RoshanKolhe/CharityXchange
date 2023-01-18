import {AuthenticationStrategy} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {JWTService} from './../services/jwt-service';

export class JWTStrategy implements AuthenticationStrategy {
  constructor(
    @inject('service.jwt.service')
    public jwtService: JWTService,
  ) {}
  name = 'jwt';
  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const token = this.extractCredentials(request);
    const userPrfile = await this.jwtService.verifyToken(token);
    return Promise.resolve(userPrfile);
  }
  extractCredentials(request: Request): string {
    if (!request.headers.authorization) {
      throw new HttpErrors.Unauthorized('Autherization header is missing');
    }
    const authHeaderValue = request.headers.authorization;
    if (!authHeaderValue.startsWith('Bearer')) {
      throw new HttpErrors.BadRequest(
        'Autherization header is not type of bearer',
      );
    }

    const parts = authHeaderValue.split(' ');
    if (parts.length !== 2) {
      throw new HttpErrors.BadRequest(
        `Autherization header has to many parts it must follow this pattern 'Bearer xx.yy.zz'`,
      );
    }
    const token = parts[1];
    return token;
  }
}
