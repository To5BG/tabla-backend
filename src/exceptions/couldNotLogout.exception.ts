import { HttpException, HttpStatus } from '@nestjs/common';

export class CouldNotLogout extends HttpException {
  constructor() {
    super('SIGN_OUT_UNSUCCESSFUL', HttpStatus.OK);
  }
}
