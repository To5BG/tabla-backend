import { HttpException, HttpStatus } from '@nestjs/common';

export class NewPasswordMatch extends HttpException {
  constructor() {
    super('New password must be different', HttpStatus.OK);
  }
}
