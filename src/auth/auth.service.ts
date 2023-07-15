import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LogInfo } from 'src/entities/loginfo.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { EmailNotFoundException } from 'src/exceptions/emailNotFound.exception';
import { InvalidPasswordException } from 'src/exceptions/invalidPassword.exception';
import { CouldNotSignUp } from 'src/exceptions/couldNotSignUp.exception';

/**
 *
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(LogInfo)
    private loginInfoRepository: Repository<LogInfo>,
    private usersService: UsersService
  ) {}

  /**
   * Method for signing in the system
   * @param {String} email Email credential used for signing in
   * @param {String} pass  Salted+hashed password that is being used
   * @throws {EmailNotFoundException} if no matching email was found
   * @throws {InvalidPassword} if password was invalid
   * @throws {FailedLogin} if the user entry could not be updated after validations
   * @returns {string} The user_id if credentials are valid
   */
  async signIn(email: string, pass: string): Promise<string> {
    const log_info = await this.loginInfoRepository.findOne({
      where: {
        email: email
      }
    });
    if (!log_info) throw new EmailNotFoundException();
    bcrypt.compare(pass, log_info.password, (err, res) => {
      if (err) throw err;
      if (res === false) throw new InvalidPasswordException();
    });
    this.usersService.login(log_info.user_id);
    return log_info.user_id;
  }

  /**
   * Method for registering into the system
   * @param {String} email Email credential used for signing up
   * @param {String} username Username credential used for signing up
   * @param {String} pass Plain assword for signing up
   * @returns {string} The user_id if adding user was successful
   */
    async signUp(email: string, username: string, pass: string): Promise<string> {
      let user_id = '';
      bcrypt.hash(pass, 12, async (err, res) => {
        if (err) throw err;
        const user = await this.usersService.addUser(username);
        if (!user) throw new CouldNotSignUp();
        const log_info = this.loginInfoRepository.create();
        this.loginInfoRepository.insert({
          ...log_info,
          password: res,
          email: email,
          user: user
        })
        user_id = user.id;
      });
      return user_id;
    }
}
