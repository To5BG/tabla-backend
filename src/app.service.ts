import { Injectable } from '@nestjs/common';

/**
 * Service handling main app logic
 */
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
