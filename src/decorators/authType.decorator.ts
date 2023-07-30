import { SetMetadata } from '@nestjs/common';

export enum AuthType {
  NONE,
  ACCESS,
  REFRESH,
  CONFIRM,
  RESET
}

/**
 * Decorator used for determining Auth type for endpoint, defaults to ACCESS
 */
export const Auth = (type: AuthType) => SetMetadata('auth', type);
