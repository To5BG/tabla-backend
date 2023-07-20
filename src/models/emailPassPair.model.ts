import { IsEmail, IsNotEmpty, Length, Validate } from 'class-validator';
import { ContainsNoEmoji } from 'src/validators/noEmoji.validator';
import { PasswordValidator } from 'src/validators/password.validator';

/**
 * Model for email + password (logging in, updating email, etc.)
 */
export class EmailPassPair {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(12, 64)
  @Validate(ContainsNoEmoji)
  @Validate(PasswordValidator)
  password: string;
}
