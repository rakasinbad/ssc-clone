import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class ErrorMessageService {
    constructor(private translate: TranslateService) {}

    getFormError(form: FormControl | FormGroup | FormArray, field?: string): string {
        if (!field) {
            if (!form) {
                return '';
            }

            const { errors } = form;
            if (!errors) {
                return '';
            }

            const errorType = Object.keys(errors)[0];
            if (!errorType) {
                return '';
            }

            return errors[errorType].message;
        } else {
            const Form = form.get(field);
            if (!Form) {
                return '';
            }

            const { errors } = form.get(field);
            if (!errors) {
                return '';
            }

            const errorType = Object.keys(errors)[0];
            if (!errorType) {
                return '';
            }

            return errors[errorType].message;
        }
    }

    getErrorMessageNonState(field: string, type: string, args?: any): string {
        const labelName = this.translate.instant(`FORM.${field.toUpperCase()}`);
        const labelConfirmPassword = this.translate.instant(`FORM.NEW_PASSWORD`);

        switch (type) {
            case 'alpha_pattern':
                return this.translate.instant('ERROR.ALPHA_PATTERN', { fieldName: labelName });

            case 'alpha_num_pattern':
                return this.translate.instant('ERROR.ALPHA_NUM_PATTERN', { fieldName: labelName });

            case 'confirm_password':
                return this.translate.instant('ERROR.CONFIRM', {
                    fieldName: labelName,
                    fieldNameCompare: labelConfirmPassword,
                });

            case 'file_size':
            case 'file_size_lte': {
                const { size = 0 } = args;

                return this.translate.instant(`ERROR.${String(type).toUpperCase()}`, {
                    fieldName: labelName,
                    size,
                });
            }

            case 'lt_number': {
                const { maxValue = 0 } = args;
                return this.translate.instant('ERROR.LT_NUMBER', {
                    fieldName: labelName,
                    maxValue,
                });
            }

            case 'max_number': {
                const { maxValue = 0 } = args;
                return this.translate.instant('ERROR.MAX', { fieldName: labelName, maxValue });
            }

            case 'min_number': {
                const { minValue = 0 } = args;
                return this.translate.instant('ERROR.MIN', { fieldName: labelName, minValue });
            }

            case 'min_1_photo':
                return this.translate.instant('ERROR.MIN_1_PHOTO', { fieldName: labelName });

            case 'min_1_tag':
                return this.translate.instant('ERROR.MIN_1_TAG', { fieldName: labelName });

            case 'different':
                let { fieldComparedName } = args;
                fieldComparedName = this.translate.instant(
                    `FORM.${fieldComparedName.toUpperCase()}`
                );

                return this.translate.instant('ERROR.DIFFERENT', {
                    fieldName: labelName,
                    fieldComparedName,
                });

            case 'email_pattern':
                return this.translate.instant('ERROR.EMAIL_PATTERN', { fieldName: labelName });

            case 'max_length':
                return this.translate.instant('ERROR.MAX_LENGTH', {
                    fieldName: labelName,
                    maxValue: args,
                });

            case 'mobile_phone_length_pattern':
                const { prefix, length } = args;

                return this.translate.instant('ERROR.MOBILE_PHONE_LENGTH_PATTERN', {
                    fieldName: labelName,
                    prefix,
                    length,
                });

            case 'mobile_phone_pattern':
                return this.translate.instant('ERROR.MOBILE_PHONE_PATTERN', {
                    fieldName: labelName,
                    prefix: args,
                });

            case 'mismatch_extension':
                const extensions: Array<string> = args.extensions || [];
                return this.translate.instant('ERROR.MISMATCH_EXTENSION', {
                    fieldName: labelName,
                    extensions: extensions.join(', '),
                });

            case 'numeric':
                return this.translate.instant('ERROR.NUMERIC', { fieldName: labelName });

            case 'password_unmeet_specification':
                return this.translate.instant('ERROR.PASS_UNMEET_SPEC', { fieldName: labelName });

            case 'pattern':
                return this.translate.instant('ERROR.PATTERN', { fieldName: labelName });

            case 'required':
                return this.translate.instant('ERROR.REQUIRED', { fieldName: labelName });

            case 'selected':
                return this.translate.instant('ERROR.SELECTED', { fieldName: labelName });

            case 'is_unique':
                return this.translate.instant('ERROR.IS_UNIQUE', { fieldName: labelName });

            default:
                break;
        }
    }

    getErrorMessageState(form: any, field: string): string {
        console.groupCollapsed('[ERROR MESSAGE STATE]');
        console.log(form);
        console.log(field);
        console.groupEnd();

        return 'Error';
    }
}
