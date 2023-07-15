import { IsAlphanumeric, IsEmail, IsNotEmpty } from 'class-validator';

/**
 *
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
