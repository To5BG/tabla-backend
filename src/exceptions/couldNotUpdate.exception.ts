import { HttpException, HttpStatus } from '@nestjs/common';

export class CouldNotUpdate extends HttpException {
  constructor() {
    super('UPDATE_UNSUCCESSFUL', HttpStatus.OK);
  }
}
