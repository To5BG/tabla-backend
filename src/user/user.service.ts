import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Status, User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

/**
 *
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
    const user = await this.usersRepository.findOne({
      where: {
        id: id
      }
    });
    if (!user) return undefined;
    await this.usersRepository.update(user.id, {
      lastLoggedIn: new Date(),
      status: Status.ONLINE
    });
  }

  /**
   * Method to add a user
   * @param {string} username Username of new user
   * @returns {User | undefined} Newly added user object if successful, else undefined
   */
  async addUser(username: string): Promise<User | undefined> {
    const user = this.usersRepository.create({
      username: username
    });
    const res = await this.usersRepository.insert(user);
    if (res.identifiers.length === 0) return undefined;
    return user;
  }
}
