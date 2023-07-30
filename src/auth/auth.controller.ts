import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailPassPair } from 'src/models/emailPassPair.model';
import { SignUpCredentials } from 'src/models/registerCred.model';
import { Auth, AuthType } from 'src/decorators/authType.decorator';
import { MRequest } from 'src/types/MRequest';
import { Response } from 'express';

/**
 * Endpoints for authentication (logging and registering)
 */
@Controller('')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Endpoint for logging out of the system
   * @param {MRequest} req
   * @param {Response} response
   * @returns Prompt message and the username of whoever logged out
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async signOut(@Req() req: MRequest, @Res() response: Response) {
    if (!process.env.REFRESH_COOKIE_NAME) throw new UnauthorizedException();
    const token = req.signedCookies[process.env.REFRESH_COOKIE_NAME];
    if (!token || !token.exp) throw new UnauthorizedException();
    return this.authService
      .signOut(token.sub, token.token_id, token.exp)
      .then(res => this.clearRefreshToken(response).json({ message: 'Logout was successful.', user: res }));
  }

  /**
   * Endpoint for logging into the system
   * @param {EmailPassPair} cred Credentials used to login
   * @param {Response} response
   * @returns An access token, and a refresh token in an Http-only signed cookie
   */
  @Auth(AuthType.NONE)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() cred: EmailPassPair, @Res() response: Response) {
    return this.authService
      .signIn(cred.email, cred.password)
      .then(res => this.saveRefreshToken(response, res.refresh_token).json({ access_token: res.access_token }));
  }

  /**
   * Endpoint for registering into the system
   * @param {EmailPassPair} cred Credentials to be used in the future
   * @param {Response} response
   * @returns Prompt message and username of whoever registered
   */
  @Auth(AuthType.NONE)
  @Post('signup')
  @HttpCode(HttpStatus.OK)
  async signUp(@Body() cred: SignUpCredentials, @Res() response: Response) {
    return this.authService
      .signUp(cred.email, cred.username, cred.password)
      .then(res => response.json({ message: 'Registration was successful.', user: res }));
  }

  /**
   * Endpoint for refreshing access to the system, using refresh token rotation
   * @param {MRequest} req
   * @param {Response} response
   * @returns New access token, and a new refresh token in an Http-only signed cookie
   */
  @Auth(AuthType.REFRESH)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: MRequest, @Res() response: Response) {
    const token = req.token;
    if (!token || !token.exp) throw new UnauthorizedException();
    return this.authService
      .refreshTokenAccess(token.sub, token.version, token.token_id, token.exp)
      .then(res => this.saveRefreshToken(response, res.refresh_token).json({ access_token: res.access_token }));
  }

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
