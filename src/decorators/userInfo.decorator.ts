import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { MRequest } from 'src/types/MRequest';
import { TokenPayload } from 'src/types/TokenPayload';

/**
 * Decorator for encapsulating the request JwT token payload for business layer logic
 */
export const UserInfo = createParamDecorator((_, context: ExecutionContext): TokenPayload | undefined => {
  return context.switchToHttp().getRequest<MRequest>().token;
});
