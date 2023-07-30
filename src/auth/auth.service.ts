import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Credentials } from 'src/entities/credentials.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { InvalidEmailOrPassword } from 'src/exceptions/invalidEmailOrPassword.exception';
import { CouldNotSignUp } from 'src/exceptions/couldNotSignUp.exception';
import { CouldNotLogin } from 'src/exceptions/couldNotLogin.exception';
import { DuplicateEmail } from 'src/exceptions/emailExists.exception';
import { JwtService } from '@nestjs/jwt';
import { readFileSync } from 'fs';
import { join } from 'path';
import { CouldNotUpdate } from 'src/exceptions/couldNotUpdate.exception';
import { NewPasswordMatch } from 'src/exceptions/newPasswordMatch.exception';
import { randomUUID } from 'crypto';
import { TokenPair } from 'src/types/TokenPair';
import { TokenPayload } from 'src/types/TokenPayload';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RedisCache } from 'cache-manager-redis-yet';
import { CouldNotLogout } from 'src/exceptions/couldNotLogout.exception';

/**
 * Service to handle authentication logic (logging, registering, tokens)
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: RedisCache,
    @InjectRepository(Credentials)
    private credRepository: Repository<Credentials>,
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  /**
   * Method for signing in the system
   * @param {string} email Email credential used for signing in
   * @param {string} pass  Salted+hashed password that is being used
   * @throws {InvalidEmailOrPassword} if no matching email was found or password is incorrect
   * @throws {CouldNotLogin} if package/db errors out
   * @returns {TokenPair} Pair of access and refresh token to be used
   */
  async signIn(email: string, pass: string, tokenid?: string): Promise<TokenPair> {
    let cred: Credentials;
    return new Promise((resolve, reject) =>
      this.credRepository
        .findOne({
          where: {
            email: email
          }
        })
        .then(async res => {
          // email not found
          if (!res) throw new InvalidEmailOrPassword();
          cred = res;
          return bcrypt
            .compare(pass, res.password)
            .catch(() => {
              throw new CouldNotLogin();
            })
            .then(res => res);
        })
        .then(res => {
          // incorrect password
          if (!res) throw new InvalidEmailOrPassword();
          return this.usersService.login(cred.user_id);
        })
        .then(res => {
          if (!res) throw new CouldNotLogin();
          const payload = {
            sub: res.id,
            username: res.username,
            token_id: tokenid ?? randomUUID(),
            version: cred.version
          };
          return Promise.all([this.generateAccessToken(payload), this.generateRefreshToken(payload)]);
        })
        // TODO: Send confirmation once a mailer is incorporated
        .then(res =>
          resolve({
            access_token: res[0],
            refresh_token: res[1]
          })
        )
        .catch(rej => reject(rej))
    );
  }

  /**
   * Method for signing out from the system
   * @param {string} id Id of user that signs out
   * @param {string} tokenId Id of used refresh token
   * @param {number} exp  Expiration date of used refresh token, in seconds as per JWT standard
   * @returns {string} The username if logging out the user was successful
   */
  async signOut(id: string, tokenId: string, exp: number): Promise<string> {
    return new Promise((resolve, reject) =>
      this.credRepository
        .findOne({
          where: {
            user_id: id
          }
        })
        .then(res => {
          if (!res) throw new CouldNotLogout();
          const now_unix = Math.floor(Date.now() / 1000);
          return Promise.all([
            this.usersService.logout(res.user_id),
            this.cacheManager.set(`blacklist_token:${id}:${tokenId}`, now_unix, (exp - now_unix) * 1000)
          ]);
        })
        .then(res => {
          if (!res[0]) throw new CouldNotLogout();
          resolve(res[0].username);
        })
        .catch(rej => reject(rej))
    );
  }

  /**
   * Method for registering into the system
   * @param {string} email Email credential used for signing up
   * @param {string} username Username credential used for signing up
   * @param {string} pass Plain assword for signing up
   * @throws {CouldNotSignUp} if package/db errors out
   * @returns {string} The username if adding the user was successful
   */
  async signUp(email: string, username: string, pass: string): Promise<string> {
    let user: string;
    await this.checkEmailUniqueness(email);
    return new Promise((resolve, reject) =>
      Promise.all([
        bcrypt.hash(pass, 12).catch(() => {
          throw new CouldNotSignUp();
        }),
        this.usersService.addUser(username)
      ])
        .then(res => {
          if (!res[1]) throw new CouldNotSignUp();
          user = res[1].username;
          const log_info = this.credRepository.create({
            user_id: res[1].id,
            password: res[0],
            email: email
          });
          return this.credRepository.insert(log_info);
        })
        // TODO: Send confirmation once a mailer is incorporated
        .then(() => resolve(user))
        .catch(rej => reject(rej))
    );
  }

  /**
   * Method to update the password of a user
   * @param {string} id Id of user to be updated
   * @param {string} oldPassword Old password of user for verification
   * @param {string} newPassword New password of user
   * @returns {Credentials | undefined} Updated credentials object if successful, else undefined
   */
  async updatePassword(id: string, oldPassword: string, newPassword: string): Promise<Credentials> {
    let new_data = {};
    const cred = await this.credRepository.findOne({
      where: {
        user_id: id
      }
    });
    if (!cred) throw new CouldNotUpdate();
    return new Promise((resolve, reject) =>
      Promise.all([
        bcrypt
          .compare(oldPassword, cred.password)
          .catch(() => {
            throw new CouldNotUpdate();
          })
          .then(res => res),
        bcrypt
          .compare(newPassword, cred.password)
          .catch(() => {
            throw new CouldNotUpdate();
          })
          .then(res => res)
      ])
        .then(res => {
          if (!res[0]) throw new InvalidEmailOrPassword();
          if (res[1]) throw new NewPasswordMatch();
          return bcrypt.hash(newPassword, 12);
        })
        .catch(() => {
          throw new CouldNotSignUp();
        })
        .then(res => {
          new_data = {
            password: res,
            version: cred.version + 1,
            passwordUpdatedAt: new Date()
          };
          return this.credRepository.update(id, new_data);
        })
        .then(() => resolve({ ...cred, ...new_data } as Credentials))
        .catch(rej => reject(rej))
    );
  }

  /**
   * Method to update the email of a user
   * @param {string} id Id of user to be updated
   * @param {string} email New email of user
   * @returns {Credentials | undefined} Updated credentials object if successful, else undefined
   */
  async updateEmail(id: string, email: string): Promise<Credentials> {
    await this.checkEmailUniqueness(email);
    const cred = await this.credRepository.findOne({
      where: {
        user_id: id
      }
    });
    if (!cred) throw new CouldNotUpdate();
    const new_data = {
      email: email
    };
    return this.credRepository.update(id, new_data).then(() => ({ ...cred, ...new_data } as Credentials));
  }

  /**
   * Method for getting a new refresh token (and an access token for convenience)
   * @param {string} id Id of user to renew token for
   * @param {number} version Version of user credentials
   * @param {string} tokenId Id of token used for request
   * @param {number} exp Expiration time of token
   * @returns {TokenPair} A set of new refresh and access tokens for authentication
   */
  async refreshTokenAccess(id: string, version: number, tokenId: string, exp: number): Promise<TokenPair> {
    await this.checkIfTokenIsBlacklisted(id, tokenId);
    return new Promise((resolve, reject) => {
      this.usersService
        .getUser(id)
        .then(res => {
          if (!res) throw new CouldNotUpdate();
          return {
            sub: res.id,
            username: res.username,
            token_id: tokenId,
            version: version
          };
        })
        .then(res => {
          const now_unix = Math.floor(Date.now() / 1000);
          return Promise.all([
            this.generateAccessToken(res),
            this.generateRefreshToken(res),
            this.cacheManager.set(`blacklist_token:${id}:${tokenId}`, now_unix, (exp - now_unix) * 1000)
          ]);
        })
        .then(res =>
          resolve({
            access_token: res[0],
            refresh_token: res[1]
          })
        )
        .catch(rej => reject(rej));
    });
  }

  /**
   * Method to check the uniqueness of an email
   * @param {string} email Email to be checked
   * @throws {DuplicateEmail} if the email is already used
   * @returns {void}
   */
  private async checkEmailUniqueness(email: string): Promise<void> {
    // check for unique email
    const res = await this.credRepository.findOne({
      where: {
        email: email
      }
    });
    if (res) throw new DuplicateEmail();
  }

  /**
   * Helper for generating an access token
   * @param {TokenPayload} payload Payload of JWT access token
   * @returns {string} The resulting token
   */
  private async generateAccessToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      privateKey: readFileSync(join(__dirname, '..', '..', '..', 'jwtES384key.pem'), 'utf-8'),
      expiresIn: parseInt(process.env.JWT_ACCESS_TIME ?? '60', 10),
      algorithm: 'ES384'
    });
  }

  /**
   * Helper for generating a refresh token
   * @param {TokenPayload} payload Payload of JWT refresh token
   * @returns {string} The resulting token
   */
  private async generateRefreshToken(payload: TokenPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: parseInt(process.env.JWT_REFRESH_TIME ?? '3600', 10),
      algorithm: 'HS512'
    });
  }

  /**
   * Throws an error in case the blacklist cache contains the given userid-tokenid pair
   * @param {string} userId Id of user
   * @param {string} tokenId Id of token
   * @returns {void}
   */
  private async checkIfTokenIsBlacklisted(userId: string, tokenId: string): Promise<void> {
    const time = await this.cacheManager.get(`blacklist_token${userId}:${tokenId}`);
    if (time) throw new UnauthorizedException('Invalid token');
  }
}
