import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Pipe({ name: 'hasErrorField', pure: true })
export class HasErrorFieldPipe implements PipeTransform {
    transform(value: any, formControl: AbstractControl, isMatError: boolean = true): boolean {
        if (!(formControl instanceof AbstractControl) || !formControl) {
            return false;
        }

        const errors = formControl.errors;
        const touched = formControl.touched;
        const dirty = formControl.dirty;

        if (isMatError) {
            return errors && (dirty || touched);
        }

        return errors && ((touched && dirty) || touched);
    }
}
