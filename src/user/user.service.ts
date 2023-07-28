import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { DuplicateUsername } from 'src/exceptions/usernameExists.exception';
import { Status } from 'src/types/Status';
import { QueryFailedError, Repository } from 'typeorm';

/**
 * Service to handle user-related logic (adding users, updating columns, settings, etc.)
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  /**
   * Method to update user data on login
   * @param {string} id Id of user to update
   * @returns {User | undefined} Updated user object if successful, else undefined
   */
  async login(id: string): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    const new_data = {
      lastLoggedIn: new Date(),
      status: Status.ONLINE
    };
    return this.usersRepository.update(user.id, new_data).then(() => ({ ...user, ...new_data } as User));
  }

  /**
   * Method to update user data on logout
   * @param {string} id Id of user to update
   * @returns {User | undefined} Updated user object if successful, else undefined
   */
  async logout(id: string): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    const new_data = {
      status: Status.OFFLINE
    };
    return this.usersRepository.update(user.id, new_data).then(() => ({ ...user, ...new_data } as User));
  }

  /**
   * Method to update the username of a user
   * @param {string} id Id of user to update
   * @param {string} username New username of user
   * @returns {User | undefined} Updated user object if successful, else undefined
   */
  async updateUsername(id: string, username: string): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    const new_data = {
      username: username
    };
    return this.usersRepository
      .update(user.id, new_data)
      .then(() => ({ ...user, ...new_data } as User))
      .catch((rej: QueryFailedError) => {
        if (rej.message.includes('duplicate key value violates unique constraint')) throw new DuplicateUsername();
        throw rej;
      });
  }

  /**
   * Method to add a user
   * @param {string} username Username of new user
   * @throws {DuplicateUsername} if user with this username already exists
   * @returns {User | undefined} Newly added user object if successful, else undefined
   */
  async addUser(username: string): Promise<User | undefined> {
    const user = this.usersRepository.create({
      username: username
    });
    const res = await this.usersRepository.insert(user).catch((rej: QueryFailedError) => {
      if (rej.message.includes('duplicate key value violates unique constraint')) throw new DuplicateUsername();
      throw rej;
    });
    if (res.identifiers.length === 0) return undefined;
    return user;
  }

  /**
   * Removes a user from the database
   * @param {string} id Id of user to be removed
   * @returns {User | undefined} The user that was removed, if the operation was a success, else undefined
   */
  async removeUser(id: string): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    return this.usersRepository.delete(id).then(() => user);
  }

  /**
   * A base getter for a user by id
   * @param {string} id Id of user to fetch
   * @returns {User | null} Fetched user, if it exists
   */
  async getUser(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        id: id
      }
    });
  }
}
