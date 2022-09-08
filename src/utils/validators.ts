import { registerDecorator, ValidationOptions } from 'class-validator';
import * as moment from 'moment';

export function IsOnlyDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsOnlyDate',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        message: 'Please provide only date like 12/08/2020',
        ...validationOptions,
      },
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validate(value: any) {
          const regex = /^([0]{0,1}[1-9]|1[0-2])\/(([0]{0,1}[1-9]|[12]\d|3[01])\/[12]\d{3})$/;
          return (
            typeof value === 'string' && regex.test(value) && moment(value, 'MM/DD/YYYY').isValid()
          );
        },
      },
    });
  };
}
