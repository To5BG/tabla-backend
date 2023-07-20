import { IsAlphanumeric, IsNotEmpty, Length, Validate } from 'class-validator';
import { ContainsNoEmoji } from 'src/validators/noEmoji.validator';
import { PasswordValidator } from 'src/validators/password.validator';

/**
 * Model for username + password (logging in, updating username, etc.)
 */
export class UserPassPair {
  @IsNotEmpty()
  @IsAlphanumeric()
  username: string;

  @IsNotEmpty()
  @Length(12, 64)
  @Validate(ContainsNoEmoji)
  @Validate(PasswordValidator)
  password: string;
}
