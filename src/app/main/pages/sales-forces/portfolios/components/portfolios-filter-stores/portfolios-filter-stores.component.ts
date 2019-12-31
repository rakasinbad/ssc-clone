import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Inject, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Store as NgRxStore } from '@ngrx/store';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { RxwebValidators } from '@rxweb/reactive-form-validators';

import { ErrorMessageService } from 'app/shared/helpers';
import { StoreType, StoreSegment } from 'app/shared/models';
import { fromDropdown } from 'app/shared/store/reducers';
import { DropdownSelectors } from 'app/shared/store/selectors';
import { takeUntil, map } from 'rxjs/operators';
import { DropdownActions } from 'app/shared/store/actions';
import { StoreActions } from '../../store/actions';
import { fromStore } from '../../store/reducers';

@Component({
    selector: 'app-portfolios-filter-stores',
    templateUrl: './portfolios-filter-stores.component.html',
    styleUrls: ['./portfolios-filter-stores.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfoliosFilterStoresComponent implements OnInit, OnDestroy {

    form: FormGroup;

    subs$: Subject<void> = new Subject<void>();
    storeTypes$: Observable<Array<StoreType>>;
    storeSegments$: Observable<Array<StoreSegment>>;

    constructor(
        private fb: FormBuilder,
        private matDialog: MatDialog,
        private errorMessageSvc: ErrorMessageService,
        private dropdownStore: NgRxStore<fromDropdown.State>,
        private shopStore: NgRxStore<fromStore.State>,
        @Inject(MAT_DIALOG_DATA)
            public data: { title: string }
    ) {}

    getFormError(form: any): string {
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

    submit(): void {
        // Menyiapkan payload untuk dikirim ke state.
        const payload: {
            storeType: string;
            storeSegment: string
        } = this.form.getRawValue();

        // Mengirim ke state dengan payload.
        this.shopStore.dispatch(
            StoreActions.applyStoreFilter({
                payload
            })
        );

        // Menutup dialog.
        this.close();
    }

    close(): void {
        // Menutup dialog.
        this.matDialog.closeAll();
    }

    ngOnInit(): void {
        // Inisialisasi form.
        this.form = this.fb.group({
            storeType: ['', [
                // RxwebValidators.required({
                //     message: this.errorMessageSvc.getErrorMessageNonState('default', 'required'),
                // }),
            ]],
            storeSegment: ['', [
                // RxwebValidators.required({
                //     message: this.errorMessageSvc.getErrorMessageNonState('default', 'required'),
                // }),
            ]]
        });

        this.storeTypes$ = this.dropdownStore.select(
            DropdownSelectors.getStoreTypeDropdownState
        ).pipe(
            map(storeTypes => {
                if (!storeTypes || storeTypes.length === 0) {
                    this.dropdownStore.dispatch(DropdownActions.fetchDropdownStoreTypeRequest());
                }

                return storeTypes;
            }),
            takeUntil(this.subs$)
        );

        this.storeSegments$ = this.dropdownStore.select(
            DropdownSelectors.getStoreSegmentDropdownState
        ).pipe(
            map(storeSegments => {
                if (!storeSegments || storeSegments.length === 0) {
                    this.dropdownStore.dispatch(DropdownActions.fetchDropdownStoreSegmentRequest());
                }

                return storeSegments;
            }),
            takeUntil(this.subs$)
        );
    }

    ngOnDestroy(): void {
        // Untuk keperluan unsubscribe.
        this.subs$.next();
        this.subs$.complete();
    }

}
