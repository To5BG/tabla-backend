import { IsEmail, IsNotEmpty } from 'class-validator';

/**
 * Model for sign-in credentials
 */
export class SignInCredentials {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
