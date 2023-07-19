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

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

/**
 * Service to handle authentication logic (logging and registering)
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Credentials)
    private loginInfoRepository: Repository<Credentials>,
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
  async signIn(email: string, pass: string): Promise<TokenPair> {
    let user_id: string;
    return new Promise((resolve, reject) =>
      this.loginInfoRepository
        .findOne({
          where: {
            email: email
          }
        })
        .then(async res => {
          // email not found
          if (!res) throw new InvalidEmailOrPassword();
          user_id = res.user_id;
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
          return this.usersService.login(user_id);
        })
        .then(res => {
          if (!res) throw new CouldNotLogin();
          const payload = { sub: res.id, username: res.username };
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
    // check for unique email
    const res = await this.loginInfoRepository.findOne({
      where: {
        email: email
      }
    });
    if (res) throw new DuplicateEmail();
    return new Promise((resolve, reject) =>
      Promise.all([
        bcrypt.hash(pass, 12).catch(() => {
          throw new CouldNotSignUp();
        }),
        this.usersService.addUser(username)
      ])
        .then(res => {
          if (!res[1]) throw new CouldNotSignUp();
          const log_info = this.loginInfoRepository.create({
            user_id: res[1].id,
            password: res[0],
            email: email
          });
          user_id = res[1].id;
          return this.loginInfoRepository.insert(log_info);
        })
        // TODO: Send confirmation once a mailer is incorporated
        .then(() => resolve(user_id))
        .catch(rej => reject(rej))
    );
  }
}
