import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'passwordValidator', async: false })
export class PasswordValidator implements ValidatorConstraintInterface {
  validate(text: string) {
    if (!/.*[A-Z].*/.test(text)) return false;
    if (!/.*[a-z].*/.test(text)) return false;
    if (!/.*\d.*/.test(text)) return false;
    if (!/.*[`~!@#$%^&*()\-_=+\\|[{\]};:'",<.>/?].*/.test(text)) return false;
    return true;
  }

  defaultMessage() {
    return `Password must contain at least one uppercase and lowercase letters, a digit, and a special character!`;
  }
}