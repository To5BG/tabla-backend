import { IsAlphanumeric, IsEmail, IsNotEmpty } from 'class-validator';

/**
 * Model for sign-up/register credentials
 */
export class SignUpCredentials {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @IsAlphanumeric()
  username: string;
}
