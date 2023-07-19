import { IsAlphanumeric, IsEmail, IsNotEmpty, Length, Validate } from 'class-validator';
import { ContainsNoEmoji } from 'src/validators/noEmoji.validator';
import { PasswordValidator } from 'src/validators/password.validator';

/**
 * Model for sign-up/register credentials
 */
export class SignUpCredentials {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(12, 64)
  @Validate(ContainsNoEmoji)
  @Validate(PasswordValidator)
  password: string;

  @IsNotEmpty()
  @IsAlphanumeric()
  username: string;
}
