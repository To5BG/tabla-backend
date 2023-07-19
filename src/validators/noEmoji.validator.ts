import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'containsNoEmoji', async: false })
export class ContainsNoEmoji implements ValidatorConstraintInterface {
  validate(text: string) {
    const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;
    return !emojiRegex.test(text);
  }

  defaultMessage() {
    return `Password cannot contain emojis!`;
  }
}