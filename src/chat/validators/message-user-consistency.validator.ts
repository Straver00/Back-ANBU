import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { type CreateMessageDto } from '../dto/create-message.dto';

/**
 * Validates consistency between isSystem and userId:
 * - If isSystem is true → userId must be null/undefined
 * - If isSystem is false → userId must be a valid integer
 */
ValidatorConstraint({ name: 'MessageUserConsistency', async: false });
export class MessageUserConsistencyValidator
  implements ValidatorConstraintInterface
{
  validate(_value: unknown, args: ValidationArguments): boolean {
    const dto = args.object as CreateMessageDto;

    if (dto.isSystem) {
      return dto.userId === undefined || dto.userId === null;
    }

    return typeof dto.userId === 'number' && Number.isInteger(dto.userId);
  }

  defaultMessage(): string {
    return `If "isSystem" is true, "userId" must be null or undefined; otherwise, a valid "userId" is required.`;
  }
}
