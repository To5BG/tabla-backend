import { Injectable } from '@nestjs/common';
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

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

/**
 * Service to handle authentication logic (logging, registering, tokens)
 */
@Injectable()
export class AuthService {
  constructor(
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
   * @returns {string} The user_id if credentials are valid
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
          return Promise.all([
            this.jwtService.signAsync(payload, {
              privateKey: readFileSync(join(__dirname, '..', '..', '..', 'jwtES384key.pem'), 'utf-8'),
              expiresIn: parseInt(process.env.JWT_ACCESS_TIME || '60', 10),
              algorithm: 'ES384'
            }),
            this.jwtService.signAsync(payload, {
              secret: process.env.JWT_REFRESH_SECRET,
              expiresIn: parseInt(process.env.JWT_REFRESH_TIME || '3600', 10),
              algorithm: 'HS512'
            })
          ]);
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
   * Method for registering into the system
   * @param {string} email Email credential used for signing up
   * @param {string} username Username credential used for signing up
   * @param {string} pass Plain assword for signing up
   * @throws {CouldNotSignUp} if package/db errors out
   * @returns {string} The user_id if adding user was successful
   */
  async signUp(email: string, username: string, pass: string): Promise<string> {
    let user_id: string;
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
          user_id = res[1].id;
          const log_info = this.credRepository.create({
            user_id: user_id,
            password: res[0],
            email: email
          });
          return this.credRepository.insert(log_info);
        })
        // TODO: Send confirmation once a mailer is incorporated
        .then(() => resolve(user_id))
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
          new_data = {
            lastPassword: oldPassword,
            password: newPassword,
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

  // async refreshTokenAccess(refreshToken: string): Promise<TokenPair> {
  //   const { id, version, tokenId } =
  //     await this.jwtService.verifyToken<IRefreshToken>(
  //       refreshToken,
  //       TokenTypeEnum.REFRESH,
  //     );
  //   await this.checkIfTokenIsBlacklisted(id, tokenId);
  //   const user = await this.usersService.userByCredentials(id, version);
  //   const [accessToken, newRefreshToken] = await this.generateAuthTokens(
  //     user,
  //     domain,
  //     tokenId,
  //   );
  //   return { user, accessToken, refreshToken: newRefreshToken };
  // }

  /**
   * Method to check the uniqueness of an email
   * @param {string} email Email to be checked
   * @throws {DuplicateEmail} if the email is already used
   * @returns {void} void
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

  // // checks if a token given the ID of the user and ID of token exists on the database
  // private async checkIfTokenIsBlacklisted(
  //   userId: number,
  //   tokenId: string,
  // ): Promise<void> {
  //   const count = await this.blacklistedTokensRepository.count({
  //     user: userId,
  //     tokenId,
  //   });

  //   if (count > 0) {
  //     throw new UnauthorizedException('Token is invalid');
  //   }
  // }
}
