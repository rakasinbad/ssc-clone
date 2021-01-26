import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ErrorMessageService } from 'app/shared/helpers';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { debounceTime, distinctUntilChanged, filter, takeUntil, tap, withLatestFrom, map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatDatetimepickerInputEvent } from '@mat-datetimepicker/core';
import * as fromFlexiCombos from '../../../../main/pages/promos/flexi-combo/store/reducers';
import { Store } from '@ngrx/store';
import { FlexiComboActions } from 'app/main/pages/promos/flexi-combo/store/actions';

@Component({
  selector: 'app-extend-promo',
  templateUrl: './extend-promo.component.html',
  styleUrls: ['./extend-promo.component.scss']
})
export class ExtendPromoComponent implements OnInit {

  form: FormGroup
  btnDisabled: boolean = true
  private _unSubs$: Subject<void> = new Subject<void>();
  promoId: string
  currentStartDate: string
  currentEndDate: string
  currentStatus: string

  minStartDate: Date = new Date();
  maxStartDate: Date = null;
  minEndDate: Date = new Date();
  maxEndDate: Date = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private matDialog: MatDialogRef<ExtendPromoComponent>,
    private store: Store<fromFlexiCombos.FeatureState>,
    private _$errorMessage: ErrorMessageService
  ) {
    this.promoId = this.data.id
    this.currentStartDate = this.data.start_date
    this.currentEndDate = this.data.end_date
    this.currentStatus = this.data.status === "active" ? "Active" : "Inactive"
  }

  ngOnInit() {

    this._initForm();

    // Handle valid or invalid form status for footer action (SHOULD BE NEEDED)
    this.form.statusChanges
        .pipe(
            // distinctUntilChanged(), 
            // debounceTime(1000), 
            map((status) => {
                const { newStartDate, newEndDate } = this.form.getRawValue();

                if (!newStartDate || !newEndDate) {
                  return 'DISABLED';  
                }

                return 'ENABLED';
            }),
            takeUntil(this._unSubs$))
        .subscribe((status) => {
            this._setFormStatus(status);
        });
  }

  private _setFormStatus(status: string): void {
      console.log(`Test Form ${status}`, this.form, this.form.getRawValue());

      if (!status) {
          return;
      }

      if (status === 'ENABLED') {
        this.btnDisabled = false
        // this.form.setErrors(null)
      }

      if (status === 'DISABLED') {
        this.btnDisabled = true
        
      }
  }

  private _initForm(): void {
      this.form = this.formBuilder.group({
        newStartDate: [
            { value: null, disabled: true },
            [
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                })
            ],
        ],
        newEndDate: [
            { value: null, disabled: true },
            [
                RxwebValidators.required({
                    message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                })
            ],
        ],
      });
  }

       /**
     *
     * Handle change event for Active From Field
     * @param {MatDatetimepickerInputEvent<any>} ev
     * @memberof SKP Create
     */
    onChangeStartDate(ev: MatDatetimepickerInputEvent<any>): void {
      const startDate = ev.value;
      const endDate = this.form.get('newEndDate').value;

      if (endDate) {
          if (startDate.isAfter(endDate)) {
              this.form.get('newEndDate').reset();
          }
      }

      this.minEndDate = startDate.add(1, 'minute').toDate();
  }

  /**
   *
   * Handle change event for Active To Field
   * @param {MatDatetimepickerInputEvent<any>} ev
   * @memberof SKP Create
   */
  onChangeEndDate(ev: MatDatetimepickerInputEvent<any>): void {
      const endDate = ev.value;
      const startDate = this.form.get('newStartDate').value;

      if (startDate) {
          if (endDate.isBefore(startDate)) {
              this.form.get('newStartDate').reset();
          }
      }

      this.maxStartDate = endDate.subtract(1, 'minute').toDate();
  }

      /**
     *
     * Handle change event for Error notification
     *
     */
    hasError(field: string, isMatError = false): boolean {
        if (!field) {
            return;
        }

        const errors = this.form.get(field).errors;
        const touched = this.form.get(field).touched;
        const dirty = this.form.get(field).dirty;

        if (isMatError) {
            return errors && (dirty || touched);
        }

        return errors && ((touched && dirty) || touched);
    }

    //get Error notif
    getErrorMessage(fieldName: string, parentName?: string, index?: number): string {
        if (!fieldName) {
            return;
        }

        if (parentName && typeof index === 'number') {
            const formParent = this.form.get(parentName) as FormArray;
            const { errors } = formParent.at(index).get(fieldName);

            if (errors) {
                const type = Object.keys(errors)[0];

                if (type) {
                    return errors[type].message;
                }
            }
        } else {
            const { errors } = this.form.get(fieldName);

            if (errors) {
                const type = Object.keys(errors)[0];

                if (type) {
                    return errors[type].message;
                }
            }
        }
    }

  onClose() {
    
  }

  onSubmit() {
    const { newStartDate, newEndDate } = this.form.getRawValue();

    this.matDialog.close({
        newStartDate,
        newEndDate
    })
  }
}
