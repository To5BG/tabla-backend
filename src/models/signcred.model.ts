import { IsEmail, IsNotEmpty } from 'class-validator';

/**
 *
 */
export class SignInCredentials {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
