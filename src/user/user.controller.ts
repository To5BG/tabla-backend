import { Controller, Get } from '@nestjs/common';
import { UsersService } from './user.service';
import { TokenPayload } from 'src/types/TokenPayload';
import { UserInfo } from 'src/decorators/userInfo.decorator';

@Controller('user')
export class UserController {
  constructor(private userService: UsersService) {}

  /**
   * Endpoint for returning the user info based on provided tokens
   * @param req Request to process
   * @returns Payload of JWT token with the request
   */
  @Get('me')
  async getToken(@UserInfo() userInfo: TokenPayload) {
    return this.userService.getUser(userInfo.sub);
  }
}
