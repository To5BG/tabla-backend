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
  /**
   * Helper for clearing the refresh token from a response
   * @param {Response} res Initial response
   * @returns {Response} Modified response (without cookie)
   */
  private clearRefreshToken(res: Response): Response {
    if (!process.env.REFRESH_COOKIE_NAME) throw new HttpException('Uauthorized', HttpStatus.UNAUTHORIZED);
    return res.clearCookie(process.env.REFRESH_COOKIE_NAME);
  }

  /**
   * Helper for adding a refresh token cookie to a response
   * @param {Response} res Initial response
   * @param {string} refreshToken Token to be included
   * @returns {Response} Modified response (with cookie)
   */
  private saveRefreshToken(res: Response, refreshToken: string): Response {
    if (!process.env.REFRESH_COOKIE_NAME) throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    return res.cookie(process.env.REFRESH_COOKIE_NAME, refreshToken, {
      secure: process.env.MODE !== 'DEV',
      httpOnly: true,
      signed: true,
      expires: new Date(Date.now() + parseInt(process.env.JWT_REFRESH_TIME ?? '60', 10) * 1000)
    });
  }
}
