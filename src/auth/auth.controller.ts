import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInCredentials } from 'src/models/signcred.model';
import { SignUpCredentials } from 'src/models/registercred.model';

/**
 * Endpoints for authentication (logging and registering)
 */
@Controller('')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  signIn(@Body() cred: SignInCredentials) {
    return this.authService.signIn(cred.email, cred.password);
  }

  @Post('signup')
  signUp(@Body() cred: SignUpCredentials) {
    return this.authService.signUp(cred.email, cred.username, cred.password);
  }
}
