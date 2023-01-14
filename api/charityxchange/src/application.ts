import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import { BcryptHasher } from './services/hash.password.bcrypt';
import { MyUserService } from './services/user-service';
import { JWTService } from './services/jwt-service';
import { AuthenticationComponent, registerAuthenticationStrategy } from '@loopback/authentication';
import { JWTStrategy } from './authentication-strategy/jwt-strategy';

export {ApplicationConfig};

export class CharityxchangeApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    //set up bindings
    this.setUpBinding();

    this.component(AuthenticationComponent);
    registerAuthenticationStrategy(this, JWTStrategy);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
  setUpBinding(): void {
    this.bind('service.hasher').toClass(BcryptHasher);
    this.bind('service.user.service').toClass(MyUserService);
    this.bind('service.jwt.service').toClass(JWTService);
  }
}
