import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material';
import { MatDatetimepickerInputEvent } from '@mat-datetimepicker/core';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { ErrorMessageService, HelperService } from 'app/shared/helpers';
import { FormStatus, LifecyclePlatform } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { Subject, Observable, fromEvent } from 'rxjs';
import { takeUntil, tap, debounceTime, withLatestFrom, filter, startWith, distinctUntilChanged, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AvailableSupplierStore } from '../../../models';
import { DataAvailableSupplierStoreSelectors } from '../../../store/selectors';
import { fromAvailableSupplierStore } from '../../../store/reducers';
import { AvailableSupplierStoreActions } from '../../../store/actions';
import * as moment from 'moment';
import { FormActions } from 'app/shared/store/actions';
import { OrderHelperService } from '../../../services';

@Component({
    selector: 'app-order-store-shipment',
    templateUrl: './order-store-shipment.component.html',
    styleUrls: ['./order-store-shipment.component.scss'],
})
export class OrderStoreShipmentComponent implements OnInit, OnDestroy, AfterViewInit {
    public placeholder = 'Select store name to autofill this field';
    form: FormGroup;

    minOrderDate: Date = new Date(new Date().setDate(new Date().getDate() - 6));
    maxOrderDate: Date = new Date();

    // Mengambil state loading-nya supplier store.
    isStoreNameLoading$: Observable<boolean>;
    // Untuk menyimpan supplier store yang tersedia.
    availableStoresName$: Observable<AvailableSupplierStore[]>;
    // Untuk menyimpan jumlah semua supplier store.
    totalStoreName$: Observable<number>;
    // Untuk menyimpan supplier store selected.
    selectedStoresItems$: Observable<AvailableSupplierStore>;
    // storeName Keyword
    storeNameKeyword: string;

    // Subject for subscription
    private unSubs$: Subject<void> = new Subject<void>();
    
    @ViewChild(MatAutocompleteTrigger, { static: true }) autocompleteTrigger: MatAutocompleteTrigger;
    @ViewChild('storeNameAutoComplete', { static: true }) storeNameAutoComplete: MatAutocomplete;

    @Output() formStatusChange: EventEmitter<FormStatus> = new EventEmitter<FormStatus>();

    constructor(
        private formBuilder: FormBuilder,
        private availableSupplierStore: Store<fromAvailableSupplierStore.FeatureState>,
        private errorMessage$: ErrorMessageService,
        private orderHelperService: OrderHelperService
    ) {
        this.availableSupplierStore.dispatch(FormActions.resetFormStatus());

        // Mengambil data supplier stores di database.
        this.availableStoresName$ = this.availableSupplierStore
            .select(DataAvailableSupplierStoreSelectors.selectAll)
            .pipe(
                tap((val) => HelperService.debug('AVAILABLE STORE NAMES:', val)),
                takeUntil(this.unSubs$)
            );

        // Mengambil state select store yang terpilih.
        this.selectedStoresItems$ = this.availableSupplierStore
            .select(DataAvailableSupplierStoreSelectors.selectCurrentItem)
            .pipe(
                tap((val) => HelperService.debug('AVAILABLE STORE NAMES:', val)),
                takeUntil(this.unSubs$)
            );

        // Mengambil total supplier stores di database.
        this.totalStoreName$ = this.availableSupplierStore.select(
            DataAvailableSupplierStoreSelectors.selectTotalItem
        ).pipe(
            takeUntil(this.unSubs$)
        );

        // Mengambil state loading-nya store name.
        this.isStoreNameLoading$ = this.availableSupplierStore.select(
            DataAvailableSupplierStoreSelectors.selectIsLoading
        ).pipe(
            tap(val => HelperService.debug('IS SUPPLIER STORE LOADING?', val)),
            takeUntil(this.unSubs$)
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
        this._initForm();
    }

    ngAfterViewInit(): void {
        const orderStoreAndShipmentInfo = this.orderHelperService.getOrderStoreAndShipmentInformation();
        if (orderStoreAndShipmentInfo) {
            const { date_raw, storeId, storeName, ownerName, storeAddress, deliveryAddress, urban, warehouse } = orderStoreAndShipmentInfo
            const orderDate = moment(date_raw);

            this.form.patchValue({
                orderDate,
                storeName,
                storeId,
                ownerName,
                storeAddress,
                deliveryAddress,
                urban,
                warehouse
            })
        }

        this._initFormCheck();
    }

    ngOnDestroy(): void {
        this.unSubs$.next();
        this.unSubs$.complete();
    }

    private _initForm(): void {
        this.form = this.formBuilder.group({
            orderDate: [
                { value: '', required: true },
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            storeName: [
                null,
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            storeId: [
                { value: '' }
            ],
            ownerName: [
                { value: '', disabled: true },
            ],
            storeAddress: [
                { value: '', disabled: true },
            ],
            deliveryAddress: [
                { value: '', disabled: true },
            ],
            urban: [
                { value: '', disabled: true },
            ],
            warehouse: [
                { value: '', disabled: true },
            ]
        });

        // Handle storeName's Form Control
        (this.form.get('storeName').valueChanges as Observable<string>).pipe(
            startWith(''),
            debounceTime(500),
            distinctUntilChanged(),
            withLatestFrom(this.selectedStoresItems$),
            filter(([storeNameForm]: [AvailableSupplierStore | string, AvailableSupplierStore | string]) => {
                return !(storeNameForm instanceof AvailableSupplierStore);
            }),
            tap(([value, _]: [string, string]) => {
                const queryParams: IQueryParams = {
                    paginate: true,
                    limit: 10,
                    skip: 0,
                };
                queryParams['keyword'] = value;

                this.storeNameKeyword = value;

                this.availableSupplierStore.dispatch(
                    AvailableSupplierStoreActions.resetState()
                );
                this.availableSupplierStore.dispatch(
                    AvailableSupplierStoreActions.deselectSupplierStore()
                );
                this.availableSupplierStore.dispatch(
                    AvailableSupplierStoreActions.fetchAvailableSupplierStoresRequest({
                        payload: queryParams
                    })
                );
            }),
            takeUntil(this.unSubs$)
        ).subscribe();
    }

    private _initFormCheck(): void {
        (this.form.statusChanges as Observable<FormStatus>).pipe(
            distinctUntilChanged(),
            debounceTime(300),
            tap(value => HelperService.debug('[OrderStoreShipmentComponent] _initFormCheck', value)),
            takeUntil(this.unSubs$)
        ).subscribe(status => {
            HelperService.debug('[OrderStoreShipmentComponent] _initFormCheck - this value:', this.form.value);
            if (status === 'VALID' && this.form.get('orderDate').valid && this.form.get('storeId').value && this.form.get('storeName').value) {
                this.formStatusChange.emit('VALID');
            } else {
                this.formStatusChange.emit('DISABLED');
            }
        });
    }

    /* Start Handle Error Form */

    hasError(form: any, args: any = {}): boolean {
        const { ignoreTouched, ignoreDirty } = args;

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

    getFormError(form: any): string {
        const { errors } = form;
        if (errors && errors.matDatepickerParse && !errors.matDatepickerParse.text) {
            return 'This field is required.';
        } else {
            return this.errorMessage$.getFormError(form);
        }
    }

    /**
     *
     * Handle change event for Active From Field
     * @param {MatDatetimepickerInputEvent<any>} ev
     * @memberof FlexiComboFormComponent
     */
    onChangeOrderDate(ev: MatDatetimepickerInputEvent<any>): void {
        const orderDate = moment(ev.value).format('DD-MM-YYYY');

        let orderStoreAndShipmentInfo = this.orderHelperService.getOrderStoreAndShipmentInformation();
        orderStoreAndShipmentInfo = {
            ...orderStoreAndShipmentInfo,
            date: orderDate,
            date_raw: ev.value
        }
        this.orderHelperService.setOrderStoreAndShipmentInformation(orderStoreAndShipmentInfo);
        this.form.patchValue({ orderDate: ev.value });

        this.orderHelperService.resetFormCreateOrderOnChangeOrderDateAndStoreName();
        this.orderHelperService.setOrderDataListReset(true);
    }

    onSelectedStoreName(event: MatAutocompleteSelectedEvent): void {
        const selectedStore: AvailableSupplierStore = event.option.value;
        HelperService.debug('[OrderStoreShipmentComponent] onSelectedStoreName - selectedStore', selectedStore)
        if (!selectedStore) {
            return;
        }
        this.availableSupplierStore.dispatch(AvailableSupplierStoreActions.deselectSupplierStore());
        this.resetFormStoreName();

        const { storeName, storeId, ownerName, storeAddress, deliveryAddress, urban, warehouse } = selectedStore
        this.form.patchValue({
            storeId,
            storeName,
            ownerName,
            storeAddress,
            deliveryAddress,
            urban,
            warehouse
        })

        let orderStoreAndShipmentInfo = this.orderHelperService.getOrderStoreAndShipmentInformation();
        orderStoreAndShipmentInfo = {
            ...orderStoreAndShipmentInfo,
            ...selectedStore
        }
        this.orderHelperService.setOrderStoreAndShipmentInformation(orderStoreAndShipmentInfo);
        this.orderHelperService.resetFormCreateOrderOnChangeOrderDateAndStoreName();
        this.orderHelperService.setOrderDataListReset(true);
        this.availableSupplierStore.dispatch(AvailableSupplierStoreActions.selectSupplierStore({ payload: selectedStore.storeId }));
        this.autocompleteTrigger.closePanel();

        HelperService.debug('[OrderStoreShipmentComponent] onSelectedStoreName - this.form.value', this.form.value)
    }

    listenStoreNameAutoComplete(): void {
        HelperService.debug('[OrderStoreShipmentComponent] - listenStoreNameAutoComplete');
        setTimeout(() => this.processStoreNameAutoComplete());
    }

    processStoreNameAutoComplete(): void {
        if (this.autocompleteTrigger && this.storeNameAutoComplete && this.storeNameAutoComplete.panel) {
            fromEvent<Event>(this.storeNameAutoComplete.panel.nativeElement, 'scroll')
                .pipe(
                    map(() => ({
                        scrollTop: this.storeNameAutoComplete.panel.nativeElement.scrollTop,
                        scrollHeight: this.storeNameAutoComplete.panel.nativeElement.scrollHeight,
                        elHeight: this.storeNameAutoComplete.panel.nativeElement.clientHeight,
                    })),
                    filter(
                        ({ scrollTop, scrollHeight, elHeight }) => scrollHeight === scrollTop + elHeight
                    ),
                    tap(({ scrollTop, scrollHeight, elHeight }) =>
                        HelperService.debug('[OrderStoreShipmentComponent tap] onOpenAutocomplete fromEvent', {
                            scrollTop,
                            scrollX,
                            scrollHeight,
                            elHeight,
                        })
                    ),
                    withLatestFrom(
                      this.availableSupplierStore.select(DataAvailableSupplierStoreSelectors.selectTotal),
                      this.availableSupplierStore.select(DataAvailableSupplierStoreSelectors.selectTotalItem)
                    ),
                    takeUntil(this.autocompleteTrigger.panelClosingActions)
                )
                .subscribe({
                    next: ([{ scrollTop, scrollHeight, elHeight }, skip, total]) => {

                        const atBottom = scrollHeight === scrollTop + elHeight;
    
                        HelperService.debug('[OrderStoreShipmentComponent next] onOpenAutocomplete fromEvent', {
                            scrollTop,
                            scrollX,
                            scrollHeight,
                            elHeight,
                            atBottom,
                            skip,
                            total
                        });
    
                        if (atBottom && skip && total && skip < total) {
                            const queryParams: IQueryParams = {
                                paginate: true,
                                limit: 10,
                                skip,
                            };
    
                            if (this.storeNameKeyword) {
                                queryParams['keyword'] = this.storeNameKeyword;
                            }

                            this.availableSupplierStore.dispatch(
                                AvailableSupplierStoreActions.fetchAvailableSupplierStoresRequest({
                                    payload: queryParams
                                })
                            );
                        }
                    },
                    complete: () =>
                        HelperService.debug(
                            '[OrderStoreShipmentComponent complete] onOpenAutocomplete fromEvent'
                        ),
                });
        }
    }

    private resetFormStoreName () {
        const resetStoreName = {
            storeId: '',
            ownerName: '',
            storeAddress: '',
            deliveryAddress: '',
            urban: '',
            warehouse: ''
        };

        this.form.patchValue(resetStoreName);

        let orderStoreAndShipmentInfo = this.orderHelperService.getOrderStoreAndShipmentInformation();
        orderStoreAndShipmentInfo = {
            ...orderStoreAndShipmentInfo,
            deliveryAddress: '',
            ownerName: '',
            storeAddress: '',
            storeChannelId: '',
            storeClusterId: '',
            storeExternalId: '',
            storeGroupId: '',
            storeId: null,
            storeName: '',
            storeTypeId: '',
            supplierStoreId: '',
            urban: '',
            warehouse: ''
        }
        this.orderHelperService.setOrderStoreAndShipmentInformation(orderStoreAndShipmentInfo);
    }
}
