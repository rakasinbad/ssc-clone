import { Pipe, PipeTransform } from '@angular/core';
import { FormMode } from '../models';

@Pipe({ name: 'hasFormMode' })
export class HasFormModePipe implements PipeTransform {
    transform(value: FormMode, status: FormMode): boolean {
        return !value || !status ? false : value === status;
    }
}
