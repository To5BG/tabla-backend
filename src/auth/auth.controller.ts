import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailPassPair } from 'src/models/emailPassPair.model';
import { SignUpCredentials } from 'src/models/registerCred.model';
import { Auth, AuthType } from 'src/auth/authType.decorator';

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
  @Auth(AuthType.NONE)
  @Post('login')
  signIn(@Body() cred: EmailPassPair) {
    return this.authService.signIn(cred.email, cred.password);
  }

  /**
   * Endpoint used for registering in the application
   * @param cred Credentials to use for registeration (user + email + password)
   * @returns Id of newly added user
   */
  @Auth(AuthType.NONE)
  @Post('signup')
  signUp(@Body() cred: SignUpCredentials) {
    return this.authService.signUp(cred.email, cred.username, cred.password);
  }

  /**
   * Test endpoint used to get JWT payload data
   * @param req Request to process
   * @returns Payload of JWT token with the request
   */
  @Get('token')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getToken(@Request() req: any) {
    return req.token;
  }
}
