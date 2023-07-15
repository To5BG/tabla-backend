import { HttpException, HttpStatus } from '@nestjs/common';

export class DuplicateEmail extends HttpException {
  constructor() {
    super('EMAIL_ALREADY_EXISTS', HttpStatus.OK);
  }
}
