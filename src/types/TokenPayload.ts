/**
 * Payload of a JWT token
 */
export interface TokenPayload {
  sub: string;
  username: string;
  token_id: string;
  version: number;
}
