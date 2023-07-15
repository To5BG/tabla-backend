import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInCredentials } from 'src/models/signcred.model';

/**
 *
 */
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  signIn(@Body() cred: SignInCredentials) {
    return this.authService.signIn(cred.email, cred.password);
  }
}
