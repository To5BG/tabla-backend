import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInCredentials } from 'src/models/signcred.model';
import { SignUpCredentials } from 'src/models/registercred.model';
import { Public } from 'src/decorators/publicEndpoint.decorator';

/**
 * Endpoints for authentication (logging and registering)
 */
@Controller('')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Endpoint used for logging in the application
   * @param cred Credentials to use for login (email + password)
   * @returns A refresh token to use for the AS
   */
  @Public()
  @Post('login')
  signIn(@Body() cred: SignInCredentials) {
    return this.authService.signIn(cred.email, cred.password);
  }

  /**
   * Endpoint used for registering in the application
   * @param cred Credentials to use for registeration (user + email + password)
   * @returns Id of newly added user
   */
  @Public()
  @Post('signup')
  signUp(@Body() cred: SignUpCredentials) {
    return this.authService.signUp(cred.email, cred.username, cred.password);
  }

  /**
   * Test endpoint used to get JWT payload data
   * @param req Request to process
   * @returns Payload of JWT token with the request
   */
  @Get('profile')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getProfile(@Request() req: any) {
    return req.user;
  }
}
