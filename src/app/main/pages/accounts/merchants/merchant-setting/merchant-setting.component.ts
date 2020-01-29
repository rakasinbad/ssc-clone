import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';

import { Store as NgRxStore } from '@ngrx/store';

import { locale as english } from '../i18n/en';
import { locale as indonesian } from '../i18n/id';

import { fromMerchant } from '../store/reducers';
import { UiActions } from 'app/shared/store/actions';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService } from 'app/shared/helpers';
import { Subject, Observable, combineLatest } from 'rxjs';
import { takeUntil, filter, take, distinctUntilChanged, debounceTime, tap } from 'rxjs/operators';
import { StoreSettingSelectors, StoreSelectors } from '../store/selectors';
import { StoreSettingActions } from '../store/actions';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';

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
    isLoading$: Observable<boolean>;
    selectedStoreSetting: string;
    isEdit = false;
    
    constructor(
        private fb: FormBuilder,
        private _cd: ChangeDetectorRef,
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
                        // url: '/pages/account/store-setting'
                    },
                    {
                        title: 'Store Setting',
                        translate: 'BREADCRUMBS.STORE_SETTING',
                    },
                ]
            })
        );

        this.isLoading$ = this.merchantStore.select(StoreSelectors.getIsLoading)
        .pipe(
            takeUntil(this.subs$)
        );

        this._fuseTranslationLoaderService.loadTranslations(
            indonesian,
            english
        );
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            supplierId: ['', [
                RxwebValidators.required({
                    message: this.errorMessageSvc.getErrorMessageNonState('default', 'required'),
                }),
            ]],
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
            nextNumber: [{ value: '', disabled: false }, [
                RxwebValidators.required({
                    message: this.errorMessageSvc.getErrorMessageNonState('default', 'required'),
                }),
            ]],
        });

        // setInterval(() => this.onUpdateZeroLeading(), 200);

        this.form.get('nextNumber').valueChanges
            .pipe(
                debounceTime(100),
                distinctUntilChanged(),
                takeUntil(this.subs$)
            ).subscribe((value: string) => {
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
                        value = nonZeroLeading[0];

                        if (value.length > +maxDigit) {
                            value = value.slice(0, +maxDigit);
                        }

                        this.form.get('nextNumber').patchValue(String(value).padStart(+maxDigit, '0'), optNextNumber);
                    } else {
                        this.form.get('nextNumber').patchValue(String(nonZeroLeading[1]).padStart(+maxDigit, '0'), optNextNumber);
                    }
                }
            });

        this.merchantStore.dispatch(StoreSettingActions.fetchStoreSettingsRequest({
            payload: {
                paginate: true,
                skip: 0,
                limit: 1,
                sort: 'asc',
                sortBy: 'id'
            }
        }));

        combineLatest([
            this.merchantStore.select(AuthSelectors.getUserSupplier),
            this.merchantStore.select(StoreSettingSelectors.getAllStoreSetting)
        ]).pipe(
            takeUntil(this.subs$)
        ).subscribe(([userSupplier, storeSettings]) => {
            if (userSupplier) {
                this.form.get('supplierId').setValue(userSupplier.supplierId);
            }

            if (storeSettings.length > 0) {
                this.form.get('nextNumber').disable();
                const storeSetting = storeSettings[0];
                this.merchantStore.dispatch(StoreSettingActions.setSelectedStoreSettingId({ payload: storeSetting.id }));

                this.form.get('maxDigit').setValue(storeSetting.maxDigit);
                this.form.get('prefix').setValue(storeSetting.supplierPrefix);
                setTimeout(() => {
                    this.form.get('nextNumber').enable();
                    this.form.get('nextNumber').setValue(storeSetting.storeIterationNumber);
                }, 1000);
                this.selectedStoreSetting = storeSetting.id;

                setTimeout(() => {
                    this.form.markAsPristine();
                    this._cd.markForCheck();
                }, 200);

                this.isEdit = true;
            } else {
                this.isEdit = false;
            }
        });

        this.form.get('maxDigit').valueChanges
            .pipe(
                debounceTime(100),
                distinctUntilChanged(),
                takeUntil(this.subs$)
            ).subscribe(value => {
                value = !value ? 4 : value;

                this.form.get('nextNumber').setValue(String('').padStart(value, '0'));
            });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.merchantStore.dispatch(StoreSettingActions.truncateStoreSetting());
        this.merchantStore.dispatch(StoreSettingActions.resetSelectedStoreSettingId());
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

    onSubmit(): void {
        const formValue = this.form.getRawValue();

        if (this.isEdit) {
            this.merchantStore.dispatch(StoreSettingActions.updateStoreSettingRequest({
                payload: {
                    id: this.selectedStoreSetting,
                    body: {
                        supplierId: formValue.supplierId,
                        maxDigit: formValue.maxDigit,
                        supplierPrefix: formValue.prefix,
                        storeIterationNumber: formValue.nextNumber
                    },
                }
            }));
        } else {
            this.merchantStore.dispatch(StoreSettingActions.createStoreSettingRequest({
                payload: {
                    body: {
                        supplierId: formValue.supplierId,
                        maxDigit: formValue.maxDigit,
                        supplierPrefix: formValue.prefix,
                        storeIterationNumber: formValue.nextNumber
                    },
                }
            }));
        }
    }

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
