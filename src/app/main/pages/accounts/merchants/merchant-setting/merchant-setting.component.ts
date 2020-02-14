import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy } from '@angular/core';

import { Store as NgRxStore } from '@ngrx/store';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';

import { fromMerchant } from '../store/reducers';
import { UiActions } from 'app/shared/store/actions';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService } from 'app/shared/helpers';
import { Subject } from 'rxjs';
import { takeUntil, filter, take, distinctUntilChanged, debounceTime } from 'rxjs/operators';

@Component({
    selector: 'app-merchant-setting',
    templateUrl: './merchant-setting.component.html',
    styleUrls: ['./merchant-setting.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantSettingComponent implements OnInit, OnDestroy {
    form: FormGroup;
    checked: Array<boolean> = [false];
    hasZeroLead = false;
    subs$: Subject<void> = new Subject<void>();
    
    constructor(
        private fb: FormBuilder,
        private errorMessageSvc: ErrorMessageService,
        private merchantStore: NgRxStore<fromMerchant.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
    ) {
        this.merchantStore.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                        // translate: 'BREADCRUMBS.HOME',
                        active: false
                    },
                    {
                        title: 'Store',
                        translate: 'BREADCRUMBS.STORE',
                        url: '/pages/account/store-setting'
                    },
                    {
                        title: 'Store Setting',
                        translate: 'BREADCRUMBS.STORE_SETTING',
                    },
                ]
            })
        );

        this._fuseTranslationLoaderService.loadTranslations(
            indonesian,
            english
        );
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            maxDigit: ['', [
                RxwebValidators.required({
                    message: this.errorMessageSvc.getErrorMessageNonState('default', 'required'),
                }),
            ]],
            prefix: ['', [
                RxwebValidators.required({
                    message: this.errorMessageSvc.getErrorMessageNonState('default', 'required'),
                }),
            ]],
            nextNumber: ['', [
                RxwebValidators.required({
                    message: this.errorMessageSvc.getErrorMessageNonState('default', 'required'),
                }),
            ]],
        });

        // setInterval(() => this.onUpdateZeroLeading(), 200);

        this.form.get('maxDigit').valueChanges
        .pipe(
            debounceTime(100),
            distinctUntilChanged(),
            takeUntil(this.subs$)
        ).subscribe(value => {
            value = !value ? 4 : value;

            this.form.get('nextNumber').setValue(String('').padStart(value, '0'));
        });

        this.form.get('nextNumber').valueChanges
        .pipe(
            debounceTime(100),
            distinctUntilChanged(),
            takeUntil(this.subs$)
        ).subscribe(value => {
            // if (!this.checked.every(check => check === true)) {
            //     this.checked = [true];
                
            //     const maxDigit = this.form.get('maxDigit').value || 4;
            //     const optNextNumber = { emitEvent: false };
    
            //     if (!value) {
            //         this.form.get('nextNumber').patchValue(String('').padStart(+maxDigit, '0'), optNextNumber);
            //     } else {
            //         const nonZeroLeading = String(value).split(/^0+/);
    
            //         if (nonZeroLeading.length === 0) {
            //             this.form.get('nextNumber').patchValue(String('0').padStart(+maxDigit, '0'), optNextNumber);
            //         } else if (nonZeroLeading.length === 1) {
            //             this.form.get('nextNumber').patchValue(String(nonZeroLeading[0]).padStart(+maxDigit, '0'), optNextNumber);
            //         } else {
            //             this.form.get('nextNumber').patchValue(String(nonZeroLeading[1]).padStart(+maxDigit, '0'), optNextNumber);
            //         }
            //     }
            // } else {
            //     this.checked.push(true);

            //     if (this.checked.length >= 4 && this.checked.every(check => check === true)) {
            //         this.checked = [false];
            //     }
            // }
            const maxDigit = this.form.get('maxDigit').value || 4;
            const optNextNumber = { emitEvent: false };

            if (!value) {
                this.form.get('nextNumber').patchValue(String('').padStart(+maxDigit, '0'), optNextNumber);
            } else {
                const nonZeroLeading = String(value).split(/^0+/);

                if (nonZeroLeading.length === 0) {
                    this.form.get('nextNumber').patchValue(String('0').padStart(+maxDigit, '0'), optNextNumber);
                } else if (nonZeroLeading.length === 1) {
                    this.form.get('nextNumber').patchValue(String(nonZeroLeading[0]).padStart(+maxDigit, '0'), optNextNumber);
                } else {
                    this.form.get('nextNumber').patchValue(String(nonZeroLeading[1]).padStart(+maxDigit, '0'), optNextNumber);
                }
            }
        });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.merchantStore.dispatch(UiActions.createBreadcrumb({ payload: null }));
    }

    // onUpdateZeroLeading(): void {
    //     const value = this.form.get('nextNumber').value;
    //     const maxDigit = this.form.get('maxDigit').value || 4;
    //     const optNextNumber = { onlySelf: true };

    //     this.form.get('nextNumber').disable(optNextNumber);
    //     this.form.get('nextNumber').enable(optNextNumber);

    //     if (!value) {
    //         this.form.get('nextNumber').patchValue(String('').padStart(+maxDigit, '0'), optNextNumber);
    //     } else {
    //         const nonZeroLeading = String(value).split(/^0+/);

    //         if (nonZeroLeading.length === 0) {
    //             this.form.get('nextNumber').patchValue(String('0').padStart(+maxDigit, '0'), optNextNumber);
    //         } else if (nonZeroLeading.length === 1) {
    //             this.form.get('nextNumber').patchValue(String(nonZeroLeading[0]).padStart(+maxDigit, '0'), optNextNumber);
    //         } else {
    //             this.form.get('nextNumber').patchValue(String(nonZeroLeading[1]).padStart(+maxDigit, '0'), optNextNumber);
    //         }
    //     }
    // }

    generateStoreNumber(): string {
        if (this.form.status !== 'VALID') {
            return '-';
        }

        const { prefix, nextNumber, maxDigit } = this.form.getRawValue();
        return `${prefix}${String(nextNumber).padStart(+maxDigit, '0')}`;
    }

    getFormError(form: any): string {
        // console.log('get error');
        return this.errorMessageSvc.getFormError(form);
    }

    hasError(form: any, args: any = {}): boolean {
        // console.log('check error');
        const {
            ignoreTouched,
            ignoreDirty
        } = args;

        if (ignoreTouched && ignoreDirty) {
            return !!form.errors;
        }

        if (ignoreDirty) {
            return form.errors && form.touched;
        }

        if (ignoreTouched) {
            return form.errors && form.dirty;
        }


        return form.errors && (form.dirty || form.touched);
    }
}
