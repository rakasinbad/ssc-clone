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

@Component({
    selector: 'app-merchant-setting',
    templateUrl: './merchant-setting.component.html',
    styleUrls: ['./merchant-setting.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantSettingComponent implements OnInit, OnDestroy {
    form: FormGroup;
    
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
                        url: '/pages/account/stores'
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
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
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
    }

    ngOnDestroy(): void {
        this.merchantStore.dispatch(UiActions.createBreadcrumb({ payload: null }));
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
