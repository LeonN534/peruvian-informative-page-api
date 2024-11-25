import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Trims the leading and trailing whitespace of a string property.
 * If the value is not a string, it will be considered invalid.
 */
export function Trim(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'trim',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value === 'string') {
            args.object[propertyName] = value.trim();
            return true;
          }
          return false;
        },
      },
    });
  };
}
