import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService } from 'app/shared/helpers';
import { Moment } from 'moment';

@Component({
    templateUrl: './export-filter.component.html',
    styleUrls: ['./export-filter.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportFilterComponent implements OnInit {
    form: FormGroup;
    action: string;
    dialogTitle: string;
    formConfig: any;
    statusSources: { id: string; label: string }[];

    minStartDate: Date;
    maxStartDate: Date;
    minEndDate: Date;
    maxEndDate: Date;

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private matDialogRef: MatDialogRef<ExportFilterComponent>,
        private _$errorMessage: ErrorMessageService
    ) {
        this.action = this.data.dialog.action;
        this.dialogTitle = this.data.dialog.title;
        this.formConfig = this.data.formConfig;
        this.statusSources = this.data.formConfig['status'].sources;
    }

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.form = this.initForm();

        this.initFormRule();
    }

    getErrorMessage(field: string): string {
        if (field) {
            const { errors } = this.form.get(field);

            if (errors) {
                const type = Object.keys(errors)[0];

                if (type) {
                    switch (field) {
                        case 'end':
                        case 'start':
                            if (type === 'matDatepickerParse') {
                                return this._$errorMessage.getErrorMessageNonState(
                                    'default',
                                    'pattern'
                                );
                            } else {
                                return errors[type].message;
                            }

                        default:
                            return errors[type].message;
                    }
                }
            }
        }
    }

    onChangeDate(ev: MatDatepickerInputEvent<Moment>, field: string): void {
        if (!ev.value || !field) {
            return;
        }

        switch (field) {
            case 'startDate':
                {
                    const startDate = ev.value;
                    const endDate = this.form.get('end').value;

                    if (endDate) {
                        if (startDate.isAfter(endDate)) {
                            this.form.get('end').reset();
                        } else {
                            const monthDuration = endDate.diff(startDate, 'months', true);

                            if (monthDuration > 1) {
                                this.form.get('end').reset();
                            }
                        }
                    }

                    this.minEndDate = startDate.toDate();
                    const maxEndDate = startDate.add(1, 'month');
                    this.maxEndDate = maxEndDate.toDate();
                }
                return;

            default:
                return;
        }
    }

    onChangeToday(ev: MatSlideToggleChange): void {
        if (typeof ev.checked !== 'boolean') {
            return;
        }

        const today = ev.checked;

        if (today) {
            this.form.get('start').setValue(new Date());
            this.form.get('start').disable();

            this.form.get('end').setValue(new Date());
            this.form.get('end').disable();
        } else {
            this.form.get('start').reset();
            this.form.get('start').enable();

            this.form.get('end').reset();
            this.form.get('end').enable();
        }
    }

    onClose(): void {
        this.matDialogRef.close();
    }

    onSubmit(action: string): void {
        if (!action || this.form.invalid) {
            return;
        }

        this.matDialogRef.close({ action, payload: this.form.getRawValue() });
    }

    private initForm(): FormGroup {
        return this.formBuilder.group({
            today: [false],
            start: [''],
            end: [''],
            status: ['']
        });
    }

    private initFormRule(): void {
        if (this.formConfig['status'] && this.formConfig['status'].rules) {
            if (this.formConfig['status'].rules.required) {
                this.form.get('status').setValidators([
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    }),
                    RxwebValidators.oneOf({
                        matchValues: [...this.statusSources.map(r => r.id)],
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern')
                    })
                ]);
            }

            this.form.get('status').updateValueAndValidity();
        }

        if (this.formConfig['startDate'] && this.formConfig['startDate'].rules) {
            if (this.formConfig['startDate'].rules.required) {
                this.form.get('start').setValidators([
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]);
            }

            this.form.get('start').updateValueAndValidity();
        }

        if (this.formConfig['endDate'] && this.formConfig['endDate'].rules) {
            if (this.formConfig['endDate'].rules.required) {
                this.form.get('end').setValidators([
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]);
            }

            this.form.get('end').updateValueAndValidity();
        }
    }
}
