import { HttpException, HttpStatus } from '@nestjs/common';

export class CouldNotLogin extends HttpException {
  constructor() {
    super('SIGN_IN_UNSUCCESSFUL', HttpStatus.OK);
  }
}
