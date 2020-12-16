import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'visibilityType' })
export class VisibilityTypePipe implements PipeTransform {
    transform(value: boolean): string {
        return value === true ? 'Bonus' : 'Regular';
    }
}
