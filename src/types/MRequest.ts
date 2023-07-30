import { TokenPayload } from './TokenPayload';
import { Request } from 'express';

/**
 * Modified request to contain refresh token payload, if any
 */
export interface MRequest extends Request {
  token?: TokenPayload;
}
