import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
    MAT_DIALOG_DATA,
    MatDatepickerInputEvent,
    MatDialogRef,
    MatSlideToggleChange
} from '@angular/material';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService } from 'app/shared/helpers';
import { LifecyclePlatform } from 'app/shared/models';
import { Moment } from 'moment';

@Component({
    templateUrl: './export-filter.component.html',
    styleUrls: ['./export-filter.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportFilterComponent implements OnInit {
    form: FormGroup;
    dialogTitle: string;
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
        this.dialogTitle = this.data.dialog.title;
    }

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();
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
                    const maxEndDate = startDate.add(7, 'days');
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

    onSubmit(): void {
        if (this.form.invalid) {
            return;
        }

        this.matDialogRef.close({ payload: this.form.getRawValue() });
    }

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            default:
                this._initForm();
                break;
        }
    }

    private _initForm(): void {
        this.form = this.formBuilder.group({
            today: [false],
            start: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ],
            end: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required')
                    })
                ]
            ]
        });
    }
}
