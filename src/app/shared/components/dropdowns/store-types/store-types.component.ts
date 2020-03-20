import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input, ViewChild, AfterViewInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { fuseAnimations } from '@fuse/animations';
import { environment } from 'environments/environment';

import { FormControl } from '@angular/forms';
import { ErrorMessageService, HelperService } from 'app/shared/helpers';
import { MatAutocomplete, MatAutocompleteTrigger, MatAutocompleteSelectedEvent } from '@angular/material';
import { fromEvent, Observable, Subject, BehaviorSubject, of, forkJoin } from 'rxjs';
import { tap, debounceTime, withLatestFrom, filter, takeUntil, map, startWith, distinctUntilChanged, delay, take, catchError, switchMap } from 'rxjs/operators';
import { StoreType } from './models';
import { StoreTypesApiService } from './services';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { IQueryParams } from 'app/shared/models/query.model';
import { TNullable, IPaginatedResponse, ErrorHandler } from 'app/shared/models/global.model';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { Auth } from 'app/main/pages/core/auth/models';

@Component({
    selector: 'select-store-types',
    templateUrl: './store-types.component.html',
    styleUrls: ['./store-types.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreTypesDropdownComponent implements OnInit, AfterViewInit, OnDestroy {

    // Form
    storeTypeForm: FormControl = new FormControl('');
    // Subject untuk keperluan subscription.
    subs$: Subject<void> = new Subject<void>();

    // Untuk menyimpan StoreType yang tersedia.
    availableStoreTypes$: BehaviorSubject<Array<StoreType>> = new BehaviorSubject<Array<StoreType>>([]);
    // Subject untuk mendeteksi adanya perubahan StoreType yang terpilih.
    selectedStoreType$: BehaviorSubject<StoreType> = new BehaviorSubject<StoreType>(null);
    // Menyimpan state loading-nya StoreType.
    isStoreTypeLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    // Untuk menyimpan jumlah semua province.
    totalStoreTypes$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    // Untuk mengirim data berupa lokasi yang telah terpilih.
    @Output() selected: EventEmitter<TNullable<StoreType>> = new EventEmitter<TNullable<StoreType>>();

    // Untuk keperluan AutoComplete-nya warehouse
    @ViewChild('storeTypeAutoComplete', { static: true }) storeTypeAutoComplete: MatAutocomplete;
    @ViewChild('triggerStoreType', { static: true, read: MatAutocompleteTrigger }) triggerStoreType: MatAutocompleteTrigger;

    constructor(
        private helper$: HelperService,
        private store: NgRxStore<fromAuth.FeatureState>,
        private errorMessage$: ErrorMessageService,
        private storeTypeApi$: StoreTypesApiService,
    ) {
        this.availableStoreTypes$.pipe(
            tap(x => this.debug('AVAILABLE STORE TYPES', x)),
            takeUntil(this.subs$)
        ).subscribe();

        this.selectedStoreType$.pipe(
            tap(x => this.debug('SELECTED STORE TYPE', x)),
            takeUntil(this.subs$)
        ).subscribe();

        this.isStoreTypeLoading$.pipe(
            tap(x => this.debug('IS STORE TYPE LOADING?', x)),
            takeUntil(this.subs$)
        ).subscribe();

        this.totalStoreTypes$.pipe(
            tap(x => this.debug('TOTAL STORE TYPES', x)),
            takeUntil(this.subs$)
        ).subscribe();
    }

    private toggleLoading(loading: boolean): void {
        this.isStoreTypeLoading$.next(loading);
    }

    private debug(label: string, data: any = {}): void {
        if (!environment.production) {
            // tslint:disable-next-line:no-console
            console.groupCollapsed(label, data);
            // tslint:disable-next-line:no-console
            console.trace(label, data);
            // tslint:disable-next-line:no-console
            console.groupEnd();
        }
    }

    private requestStoreType(params: IQueryParams): void {
        of(null).pipe(
            // tap(x => this.debug('DELAY 1 SECOND BEFORE GET USER SUPPLIER FROM STATE', x)),
            // delay(1000),
            withLatestFrom<any, UserSupplier>(
                this.store.select<UserSupplier>(AuthSelectors.getUserSupplier)
            ),
            tap(x => this.debug('GET USER SUPPLIER FROM STATE', x)),
            switchMap<[null, UserSupplier], Observable<IPaginatedResponse<StoreType>>>(([_, userSupplier]) => {
                // Jika user tidak ada data supplier.
                if (!userSupplier) {
                    throw new Error('ERR_USER_SUPPLIER_NOT_FOUND');
                }

                // Mengambil ID supplier-nya.
                const { supplierId } = userSupplier;

                // Membentuk query baru.
                const newQuery: IQueryParams = { ... params };
                // Memasukkan ID supplier ke dalam params baru.
                newQuery['supplierId'] = supplierId;
                // Sementara tidak membutuhkan ID supplier.
                newQuery['noSupplierId'] = true;

                // Melakukan request data warehouse.
                return this.storeTypeApi$
                    .find<IPaginatedResponse<StoreType>>(newQuery)
                    .pipe(
                        tap(() => this.toggleLoading(true)),
                        tap(response => this.debug('FIND STORE TYPE', { params: newQuery, response }))
                    );
            }),
            take(1),
            catchError(err => { throw err; }),
        ).subscribe({
            next: (response) => {
                this.availableStoreTypes$.next(response.data);
                this.totalStoreTypes$.next(response.total);
            },
            error: (err) => {
                this.debug('ERROR FIND STORE TYPE', { params, error: err }),
                this.helper$.showErrorNotification(new ErrorHandler(err));
            },
            complete: () => {
                this.toggleLoading(false);
                this.debug('FIND STORE TYPE COMPLETED');
            }
        });
    }

    private initStoreType(): void {
        // Menyiapkan query untuk pencarian store type.
        const params: IQueryParams = {
            paginate: true,
            limit: 10,
            skip: 0
        };

        // Reset form-nya store type.
        this.storeTypeForm.enable();
        this.storeTypeForm.reset();

        // Memulai request data store type.
        this.requestStoreType(params);
    }

    getFormError(form: any): string {
        // console.log('get error');
        return this.errorMessage$.getFormError(form);
    }

    hasError(form: any, args: any = {}): boolean {
        // console.log('check error');
        const { ignoreTouched, ignoreDirty } = args;

        if (ignoreTouched && ignoreDirty) {
            return !!form.errors;
        }

        if (ignoreDirty) {
            return (form.errors || form.status === 'INVALID') && form.touched;
        }

        if (ignoreTouched) {
            return (form.errors || form.status === 'INVALID') && form.dirty;
        }

        return (form.errors || form.status === 'INVALID') && (form.dirty || form.touched);
    }

    onSelectedStoreType(event: MatAutocompleteSelectedEvent): void {
        // Mengambil nilai store type terpilih.
        const storeType: StoreType = event.option.value;
        // Mengirim nilai tersebut melalui subject.
        this.selectedStoreType$.next(storeType);
    }

    displayStoreType(item: StoreType): string {
        if (!item) {
            return;
        }

        return item.name;
    }

    processStoreTypeAutoComplete(): void {
        if (this.triggerStoreType && this.storeTypeAutoComplete && this.storeTypeAutoComplete.panel) {
            fromEvent<Event>(this.storeTypeAutoComplete.panel.nativeElement, 'scroll')
                .pipe(
                    // Debugging.
                    tap(() => this.debug(`fromEvent<Event>(this.storeTypeAutoComplete.panel.nativeElement, 'scroll')`)),
                    // Kasih jeda ketika scrolling.
                    debounceTime(500),
                    // Mengambil nilai terakhir store type yang tersedia, jumlah store type dan state loading-nya store type dari subject.
                    withLatestFrom(this.availableStoreTypes$, this.totalStoreTypes$, this.isStoreTypeLoading$,
                        ($event, storeTypes, totalStoreTypes, isLoading) => ({ $event, storeTypes, totalStoreTypes, isLoading }),
                    ),
                    // Debugging.
                    tap(() => this.debug('SELECT STORE TYPE IS SCROLLING...', {})),
                    // Hanya diteruskan jika tidak sedang loading, jumlah di back-end > jumlah di state, dan scroll element sudah paling bawah.
                    filter(({ isLoading, storeTypes, totalStoreTypes }) =>
                        !isLoading && (totalStoreTypes > storeTypes.length) && this.helper$.isElementScrolledToBottom(this.storeTypeAutoComplete.panel)
                    ),
                    takeUntil(this.triggerStoreType.panelClosingActions.pipe(
                        tap(() => this.debug('SELECT STORE TYPE IS CLOSING ...'))
                    ))
                ).subscribe(({ storeTypes }) => {
                    const params: IQueryParams = {
                        paginate: true,
                        limit: 10,
                        skip: storeTypes.length
                    };

                    // Memulai request data store type.
                    this.requestStoreType(params);
                });
        }
    }

    listenStoreTypeAutoComplete(): void {
        // this.triggerStoreType.autocomplete = this.storeTypeAutoComplete;
        setTimeout(() => this.processStoreTypeAutoComplete());
    }

    ngOnInit(): void {
        // Inisialisasi form sudah tidak ada karena sudah diinisialisasi saat deklarasi variabel.
        this.initStoreType();

        // Menangani Form Control-nya warehouse.
        (this.storeTypeForm.valueChanges).pipe(
            startWith(''),
            debounceTime(200),
            distinctUntilChanged(),
            withLatestFrom(this.selectedStoreType$),
            filter(([formValue, selectedStoreType]) => {
                if (selectedStoreType && formValue && !this.storeTypeAutoComplete.isOpen) {
                    return false;
                }
                
                if (selectedStoreType || (!formValue && !this.storeTypeAutoComplete.isOpen)) {
                    this.selectedStoreType$.next(null);
                    return false;
                }

                if (!formValue && selectedStoreType && !this.storeTypeAutoComplete.isOpen) {
                    this.storeTypeForm.patchValue(selectedStoreType);
                    return false;
                }

                return true;
            }),
            tap<[string | StoreType, TNullable<StoreType>]>(([formValue, selectedStoreType]) => {
                this.debug('STORE TYPE FORM VALUE IS CHANGED', { formValue, selectedStoreType });
            }),
            takeUntil(this.subs$)
        ).subscribe(([formValue]) => {
            const queryParams: IQueryParams = {
                paginate: true,
                limit: 10,
                skip: 0
            };

            queryParams['keyword'] = formValue;

            this.requestStoreType(queryParams);
        });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.totalStoreTypes$.next(null);
        this.totalStoreTypes$.complete();

        this.selectedStoreType$.next(null);
        this.selectedStoreType$.complete();

        this.isStoreTypeLoading$.next(null);
        this.isStoreTypeLoading$.complete();

        this.availableStoreTypes$.next(null);
        this.availableStoreTypes$.complete();
    }

    ngAfterViewInit(): void { }

}

