import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { MRequest } from 'src/types/MRequest';
import { TokenPayload } from 'src/types/TokenPayload';

export const UserInfo = createParamDecorator((_, context: ExecutionContext): TokenPayload | undefined => {
  return context.switchToHttp().getRequest<MRequest>().token;
});
