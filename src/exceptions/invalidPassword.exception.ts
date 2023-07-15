import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidPasswordException extends HttpException {
  constructor() {
    super('INCORRECT_PASSWORD', HttpStatus.OK);
  }
}
