import { HttpException, HttpStatus } from '@nestjs/common';

export class EmailNotFoundException extends HttpException {
  constructor() {
    super('EMAIL_NOT_FOUND', HttpStatus.OK);
  }
}
