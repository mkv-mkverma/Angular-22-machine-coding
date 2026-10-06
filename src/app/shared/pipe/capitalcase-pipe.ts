import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalcase',
})
export class CapitalCasePipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    if (typeof value !== 'string') {
      return value;
    }
    console.log(args);
    return value.charAt(0).toLocaleUpperCase() + value.slice(1).toLocaleLowerCase();
  }
}
