import { HttpException, HttpStatus } from '@nestjs/common';

export class DuplicateUsername extends HttpException {
  constructor() {
    super('USERNAME_ALREADY_EXISTS', HttpStatus.OK);
  }
}
