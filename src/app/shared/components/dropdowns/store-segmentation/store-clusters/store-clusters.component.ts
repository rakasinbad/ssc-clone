import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input, ViewChild, AfterViewInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { fuseAnimations } from '@fuse/animations';
import { environment } from 'environments/environment';

import { FormControl } from '@angular/forms';
import { ErrorMessageService, HelperService } from 'app/shared/helpers';
import { MatAutocomplete, MatAutocompleteTrigger, MatAutocompleteSelectedEvent } from '@angular/material';
import { fromEvent, Observable, Subject, BehaviorSubject, of, forkJoin } from 'rxjs';
import { tap, debounceTime, withLatestFrom, filter, takeUntil, map, startWith, distinctUntilChanged, delay, take, catchError, switchMap } from 'rxjs/operators';
import { StoreCluster } from './models';
import { StoreClustersApiService } from './services';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { IQueryParams } from 'app/shared/models/query.model';
import { TNullable, IPaginatedResponse, ErrorHandler } from 'app/shared/models/global.model';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { Auth } from 'app/main/pages/core/auth/models';

@Component({
    selector: 'select-store-clusters',
    templateUrl: './store-clusters.component.html',
    styleUrls: ['./store-clusters.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreClustersDropdownComponent implements OnInit, AfterViewInit, OnDestroy {

    // Form
    storeClusterForm: FormControl = new FormControl('');
    // Subject untuk keperluan subscription.
    subs$: Subject<void> = new Subject<void>();

    // Untuk menyimpan StoreCluster yang tersedia.
    availableStoreClusters$: BehaviorSubject<Array<StoreCluster>> = new BehaviorSubject<Array<StoreCluster>>([]);
    // Subject untuk mendeteksi adanya perubahan StoreCluster yang terpilih.
    selectedStoreCluster$: BehaviorSubject<StoreCluster> = new BehaviorSubject<StoreCluster>(null);
    // Menyimpan state loading-nya StoreCluster.
    isStoreClusterLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    // Untuk menyimpan jumlah semua province.
    totalStoreClusters$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    // Untuk mengirim data berupa lokasi yang telah terpilih.
    @Output() selected: EventEmitter<TNullable<StoreCluster>> = new EventEmitter<TNullable<StoreCluster>>();

    // Untuk keperluan AutoComplete-nya warehouse
    @ViewChild('storeClusterAutoComplete', { static: true }) storeClusterAutoComplete: MatAutocomplete;
    @ViewChild('triggerStoreCluster', { static: true, read: MatAutocompleteTrigger }) triggerStoreCluster: MatAutocompleteTrigger;

    constructor(
        private helper$: HelperService,
        private store: NgRxStore<fromAuth.FeatureState>,
        private errorMessage$: ErrorMessageService,
        private storeClusterApi$: StoreClustersApiService,
    ) {
        this.availableStoreClusters$.pipe(
            tap(x => this.debug('AVAILABLE STORE CLUSTERS', x)),
            takeUntil(this.subs$)
        ).subscribe();

        this.selectedStoreCluster$.pipe(
            tap(x => this.debug('SELECTED STORE CLUSTER', x)),
            takeUntil(this.subs$)
        ).subscribe();

        this.isStoreClusterLoading$.pipe(
            tap(x => this.debug('IS STORE CLUSTER LOADING?', x)),
            takeUntil(this.subs$)
        ).subscribe();

        this.totalStoreClusters$.pipe(
            tap(x => this.debug('TOTAL STORE CLUSTERS', x)),
            takeUntil(this.subs$)
        ).subscribe();
    }

    private toggleLoading(loading: boolean): void {
        this.isStoreClusterLoading$.next(loading);
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

    private requestStoreCluster(params: IQueryParams): void {
        of(null).pipe(
            // tap(x => this.debug('DELAY 1 SECOND BEFORE GET USER SUPPLIER FROM STATE', x)),
            // delay(1000),
            withLatestFrom<any, UserSupplier>(
                this.store.select<UserSupplier>(AuthSelectors.getUserSupplier)
            ),
            tap(x => this.debug('GET USER SUPPLIER FROM STATE', x)),
            switchMap<[null, UserSupplier], Observable<IPaginatedResponse<StoreCluster>>>(([_, userSupplier]) => {
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
                return this.storeClusterApi$
                    .find<IPaginatedResponse<StoreCluster>>(newQuery)
                    .pipe(
                        tap(() => this.toggleLoading(true)),
                        tap(response => this.debug('FIND STORE CLUSTER', { params: newQuery, response }))
                    );
            }),
            take(1),
            catchError(err => { throw err; }),
        ).subscribe({
            next: (response) => {
                this.availableStoreClusters$.next(response.data);
                this.totalStoreClusters$.next(response.total);
            },
            error: (err) => {
                this.debug('ERROR FIND STORE CLUSTER', { params, error: err }),
                this.helper$.showErrorNotification(new ErrorHandler(err));
            },
            complete: () => {
                this.toggleLoading(false);
                this.debug('FIND STORE CLUSTER COMPLETED');
            }
        });
    }

    private initStoreCluster(): void {
        // Menyiapkan query untuk pencarian store channel.
        const params: IQueryParams = {
            paginate: true,
            limit: 10,
            skip: 0
        };

        // Reset form-nya store channel.
        this.storeClusterForm.enable();
        this.storeClusterForm.reset();

        // Memulai request data store channel.
        this.requestStoreCluster(params);
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

    onSelectedStoreCluster(event: MatAutocompleteSelectedEvent): void {
        // Mengambil nilai store channel terpilih.
        const storeCluster: StoreCluster = event.option.value;
        // Mengirim nilai tersebut melalui subject.
        this.selectedStoreCluster$.next(storeCluster);
    }

    displayStoreCluster(item: StoreCluster): string {
        if (!item) {
            return;
        }

        return item.name;
    }

    processStoreClusterAutoComplete(): void {
        if (this.triggerStoreCluster && this.storeClusterAutoComplete && this.storeClusterAutoComplete.panel) {
            fromEvent<Event>(this.storeClusterAutoComplete.panel.nativeElement, 'scroll')
                .pipe(
                    // Debugging.
                    tap(() => this.debug(`fromEvent<Event>(this.storeClusterAutoComplete.panel.nativeElement, 'scroll')`)),
                    // Kasih jeda ketika scrolling.
                    debounceTime(500),
                    // Mengambil nilai terakhir store channel yang tersedia, jumlah store channel dan state loading-nya store channel dari subject.
                    withLatestFrom(this.availableStoreClusters$, this.totalStoreClusters$, this.isStoreClusterLoading$,
                        ($event, storeClusters, totalStoreClusters, isLoading) => ({ $event, storeClusters, totalStoreClusters, isLoading }),
                    ),
                    // Debugging.
                    tap(() => this.debug('SELECT STORE CLUSTER IS SCROLLING...', {})),
                    // Hanya diteruskan jika tidak sedang loading, jumlah di back-end > jumlah di state, dan scroll element sudah paling bawah.
                    filter(({ isLoading, storeClusters, totalStoreClusters }) =>
                        !isLoading && (totalStoreClusters > storeClusters.length) && this.helper$.isElementScrolledToBottom(this.storeClusterAutoComplete.panel)
                    ),
                    takeUntil(this.triggerStoreCluster.panelClosingActions.pipe(
                        tap(() => this.debug('SELECT STORE CLUSTER IS CLOSING ...'))
                    ))
                ).subscribe(({ storeClusters }) => {
                    const params: IQueryParams = {
                        paginate: true,
                        limit: 10,
                        skip: storeClusters.length
                    };

                    // Memulai request data store channel.
                    this.requestStoreCluster(params);
                });
        }
    }

    listenStoreClusterAutoComplete(): void {
        // this.triggerStoreCluster.autocomplete = this.storeClusterAutoComplete;
        setTimeout(() => this.processStoreClusterAutoComplete());
    }

    ngOnInit(): void {
        // Inisialisasi form sudah tidak ada karena sudah diinisialisasi saat deklarasi variabel.
        this.initStoreCluster();

        // Menangani Form Control-nya warehouse.
        (this.storeClusterForm.valueChanges).pipe(
            startWith(''),
            debounceTime(200),
            distinctUntilChanged(),
            withLatestFrom(this.selectedStoreCluster$),
            filter(([formValue, selectedStoreCluster]) => {
                if (selectedStoreCluster && formValue && !this.storeClusterAutoComplete.isOpen) {
                    return false;
                }
                
                if (selectedStoreCluster || (!formValue && !this.storeClusterAutoComplete.isOpen)) {
                    this.selectedStoreCluster$.next(null);
                    return false;
                }

                if (!formValue && selectedStoreCluster && !this.storeClusterAutoComplete.isOpen) {
                    this.storeClusterForm.patchValue(selectedStoreCluster);
                    return false;
                }

                return true;
            }),
            tap<[string | StoreCluster, TNullable<StoreCluster>]>(([formValue, selectedStoreCluster]) => {
                this.debug('STORE CLUSTER FORM VALUE IS CHANGED', { formValue, selectedStoreCluster });
            }),
            takeUntil(this.subs$)
        ).subscribe(([formValue]) => {
            const queryParams: IQueryParams = {
                paginate: true,
                limit: 10,
                skip: 0
            };

            queryParams['keyword'] = formValue;

            this.requestStoreCluster(queryParams);
        });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.totalStoreClusters$.next(null);
        this.totalStoreClusters$.complete();

        this.selectedStoreCluster$.next(null);
        this.selectedStoreCluster$.complete();

        this.isStoreClusterLoading$.next(null);
        this.isStoreClusterLoading$.complete();

        this.availableStoreClusters$.next(null);
        this.availableStoreClusters$.complete();
    }

    ngAfterViewInit(): void { }

}

