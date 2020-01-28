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
import { takeUntil, map, withLatestFrom, tap } from 'rxjs/operators';
import { DropdownActions } from 'app/shared/store/actions';
import { StoreActions } from '../../store/actions';
import { fromStore } from '../../store/reducers';
import { Filter } from '../../models';

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

    public click: Subject<void> = new Subject<void>();

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
    ) { }

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

        this.click.pipe(
            withLatestFrom(
                this.dropdownStore.select(DropdownSelectors.getStoreTypeDropdownState),
                this.dropdownStore.select(DropdownSelectors.getStoreSegmentDropdownState),
                (_, storeTypes, storeSegments) => ({ storeTypes, storeSegments })
            ),
            tap(() => console.log('Event clicked')),
            takeUntil(this.subs$)
        ).subscribe(({ storeTypes, storeSegments }: { storeTypes: Array<StoreType>, storeSegments: Array<StoreSegment> }) => {
            // Menyiapkan payload untuk dikirim ke state.
            const payload: Array<Filter> = [];
            const formValue = this.form.getRawValue();
    
            if (formValue.storeSegment) {
                const selectedStoreSegment = storeSegments.find(store => store.id === formValue.storeSegment);
    
                payload.push({
                    id: 'storeSegment',
                    title: 'Store Segment',
                    value: {
                        title: selectedStoreSegment.name,
                        value: selectedStoreSegment.id
                    }
                });
            }
    
            if (formValue.storeType) {
                const selectedStoreType = storeTypes.find(store => store.id === formValue.storeType);
    
                payload.push({
                    id: 'storeType',
                    title: 'Store Type',
                    value: {
                        title: selectedStoreType.name,
                        value: selectedStoreType.id
                    }
                });
            }
    
            // Mengirim ke state dengan payload.
            this.shopStore.dispatch(
                StoreActions.applyStoreFilter({
                    payload
                })
            );
    
            // Menutup dialog.
            this.close();
        });
    }

    ngOnDestroy(): void {
        // Untuk keperluan unsubscribe.
        this.subs$.next();
        this.subs$.complete();

        // Melepas subject pada handler click submit.
        this.click.next();
        this.click.complete();
    }

}
