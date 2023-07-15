import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidEmailOrPassword extends HttpException {
  constructor() {
    super('INVALID_EMAIL_OR_PASSWORD', HttpStatus.OK);
  }
}
