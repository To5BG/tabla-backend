import { HttpException, HttpStatus } from '@nestjs/common';

export class CouldNotSignUp extends HttpException {
  constructor() {
    super('SIGN_UP_UNSUCCESSFUL', HttpStatus.OK);
  }
}
