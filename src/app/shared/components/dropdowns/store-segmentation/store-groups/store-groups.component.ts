import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input, ViewChild, AfterViewInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { fuseAnimations } from '@fuse/animations';
import { environment } from 'environments/environment';

import { FormControl } from '@angular/forms';
import { ErrorMessageService, HelperService } from 'app/shared/helpers';
import { MatAutocomplete, MatAutocompleteTrigger, MatAutocompleteSelectedEvent } from '@angular/material';
import { fromEvent, Observable, Subject, BehaviorSubject, of, forkJoin } from 'rxjs';
import { tap, debounceTime, withLatestFrom, filter, takeUntil, map, startWith, distinctUntilChanged, delay, take, catchError, switchMap } from 'rxjs/operators';
import { StoreGroup } from './models';
import { StoreGroupsApiService } from './services';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { IQueryParams } from 'app/shared/models/query.model';
import { TNullable, IPaginatedResponse, ErrorHandler } from 'app/shared/models/global.model';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { Auth } from 'app/main/pages/core/auth/models';

@Component({
    selector: 'select-store-groups',
    templateUrl: './store-groups.component.html',
    styleUrls: ['./store-groups.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreGroupsDropdownComponent implements OnInit, AfterViewInit, OnDestroy {

    // Form
    storeGroupForm: FormControl = new FormControl('');
    // Subject untuk keperluan subscription.
    subs$: Subject<void> = new Subject<void>();

    // Untuk menyimpan StoreGroup yang tersedia.
    availableStoreGroups$: BehaviorSubject<Array<StoreGroup>> = new BehaviorSubject<Array<StoreGroup>>([]);
    // Subject untuk mendeteksi adanya perubahan StoreGroup yang terpilih.
    selectedStoreGroup$: BehaviorSubject<StoreGroup> = new BehaviorSubject<StoreGroup>(null);
    // Menyimpan state loading-nya StoreGroup.
    isStoreGroupLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    // Untuk menyimpan jumlah semua province.
    totalStoreGroups$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    // Untuk mengirim data berupa lokasi yang telah terpilih.
    @Output() selected: EventEmitter<TNullable<StoreGroup>> = new EventEmitter<TNullable<StoreGroup>>();

    // Untuk keperluan AutoComplete-nya warehouse
    @ViewChild('storeGroupAutoComplete', { static: true }) storeGroupAutoComplete: MatAutocomplete;
    @ViewChild('triggerStoreGroup', { static: true, read: MatAutocompleteTrigger }) triggerStoreGroup: MatAutocompleteTrigger;

    constructor(
        private helper$: HelperService,
        private store: NgRxStore<fromAuth.FeatureState>,
        private errorMessage$: ErrorMessageService,
        private storeGroupApi$: StoreGroupsApiService,
    ) {
        this.availableStoreGroups$.pipe(
            tap(x => this.debug('AVAILABLE STORE GROUPS', x)),
            takeUntil(this.subs$)
        ).subscribe();

        this.selectedStoreGroup$.pipe(
            tap(x => this.debug('SELECTED STORE GROUP', x)),
            takeUntil(this.subs$)
        ).subscribe();

        this.isStoreGroupLoading$.pipe(
            tap(x => this.debug('IS STORE GROUP LOADING?', x)),
            takeUntil(this.subs$)
        ).subscribe();

        this.totalStoreGroups$.pipe(
            tap(x => this.debug('TOTAL STORE GROUPS', x)),
            takeUntil(this.subs$)
        ).subscribe();
    }

    private toggleLoading(loading: boolean): void {
        this.isStoreGroupLoading$.next(loading);
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

    private requestStoreGroup(params: IQueryParams): void {
        of(null).pipe(
            // tap(x => this.debug('DELAY 1 SECOND BEFORE GET USER SUPPLIER FROM STATE', x)),
            // delay(1000),
            withLatestFrom<any, UserSupplier>(
                this.store.select<UserSupplier>(AuthSelectors.getUserSupplier)
            ),
            tap(x => this.debug('GET USER SUPPLIER FROM STATE', x)),
            switchMap<[null, UserSupplier], Observable<IPaginatedResponse<StoreGroup>>>(([_, userSupplier]) => {
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
                return this.storeGroupApi$
                    .find<IPaginatedResponse<StoreGroup>>(newQuery)
                    .pipe(
                        tap(() => this.toggleLoading(true)),
                        tap(response => this.debug('FIND STORE GROUP', { params: newQuery, response }))
                    );
            }),
            take(1),
            catchError(err => { throw err; }),
        ).subscribe({
            next: (response) => {
                this.availableStoreGroups$.next(response.data);
                this.totalStoreGroups$.next(response.total);
            },
            error: (err) => {
                this.debug('ERROR FIND STORE GROUP', { params, error: err }),
                this.helper$.showErrorNotification(new ErrorHandler(err));
            },
            complete: () => {
                this.toggleLoading(false);
                this.debug('FIND STORE GROUP COMPLETED');
            }
        });
    }

    private initStoreGroup(): void {
        // Menyiapkan query untuk pencarian store group.
        const params: IQueryParams = {
            paginate: true,
            limit: 10,
            skip: 0
        };

        // Reset form-nya store group.
        this.storeGroupForm.enable();
        this.storeGroupForm.reset();

        // Memulai request data store group.
        this.requestStoreGroup(params);
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

    onSelectedStoreGroup(event: MatAutocompleteSelectedEvent): void {
        // Mengambil nilai store group terpilih.
        const storeGroup: StoreGroup = event.option.value;
        // Mengirim nilai tersebut melalui subject.
        this.selectedStoreGroup$.next(storeGroup);
    }

    displayStoreGroup(item: StoreGroup): string {
        if (!item) {
            return;
        }

        return item.name;
    }

    processStoreGroupAutoComplete(): void {
        if (this.triggerStoreGroup && this.storeGroupAutoComplete && this.storeGroupAutoComplete.panel) {
            fromEvent<Event>(this.storeGroupAutoComplete.panel.nativeElement, 'scroll')
                .pipe(
                    // Debugging.
                    tap(() => this.debug(`fromEvent<Event>(this.storeGroupAutoComplete.panel.nativeElement, 'scroll')`)),
                    // Kasih jeda ketika scrolling.
                    debounceTime(500),
                    // Mengambil nilai terakhir store group yang tersedia, jumlah store group dan state loading-nya store group dari subject.
                    withLatestFrom(this.availableStoreGroups$, this.totalStoreGroups$, this.isStoreGroupLoading$,
                        ($event, storeGroups, totalStoreGroups, isLoading) => ({ $event, storeGroups, totalStoreGroups, isLoading }),
                    ),
                    // Debugging.
                    tap(() => this.debug('SELECT STORE GROUP IS SCROLLING...', {})),
                    // Hanya diteruskan jika tidak sedang loading, jumlah di back-end > jumlah di state, dan scroll element sudah paling bawah.
                    filter(({ isLoading, storeGroups, totalStoreGroups }) =>
                        !isLoading && (totalStoreGroups > storeGroups.length) && this.helper$.isElementScrolledToBottom(this.storeGroupAutoComplete.panel)
                    ),
                    takeUntil(this.triggerStoreGroup.panelClosingActions.pipe(
                        tap(() => this.debug('SELECT STORE GROUP IS CLOSING ...'))
                    ))
                ).subscribe(({ storeGroups }) => {
                    const params: IQueryParams = {
                        paginate: true,
                        limit: 10,
                        skip: storeGroups.length
                    };

                    // Memulai request data store group.
                    this.requestStoreGroup(params);
                });
        }
    }

    listenStoreGroupAutoComplete(): void {
        // this.triggerStoreGroup.autocomplete = this.storeGroupAutoComplete;
        setTimeout(() => this.processStoreGroupAutoComplete());
    }

    ngOnInit(): void {
        // Inisialisasi form sudah tidak ada karena sudah diinisialisasi saat deklarasi variabel.
        this.initStoreGroup();

        // Menangani Form Control-nya warehouse.
        (this.storeGroupForm.valueChanges).pipe(
            startWith(''),
            debounceTime(200),
            distinctUntilChanged(),
            withLatestFrom(this.selectedStoreGroup$),
            filter(([formValue, selectedStoreGroup]) => {
                if (selectedStoreGroup && formValue && !this.storeGroupAutoComplete.isOpen) {
                    return false;
                }
                
                if (selectedStoreGroup || (!formValue && !this.storeGroupAutoComplete.isOpen)) {
                    this.selectedStoreGroup$.next(null);
                    return false;
                }

                if (!formValue && selectedStoreGroup && !this.storeGroupAutoComplete.isOpen) {
                    this.storeGroupForm.patchValue(selectedStoreGroup);
                    return false;
                }

                return true;
            }),
            tap<[string | StoreGroup, TNullable<StoreGroup>]>(([formValue, selectedStoreGroup]) => {
                this.debug('STORE GROUP FORM VALUE IS CHANGED', { formValue, selectedStoreGroup });
            }),
            takeUntil(this.subs$)
        ).subscribe(([formValue]) => {
            const queryParams: IQueryParams = {
                paginate: true,
                limit: 10,
                skip: 0
            };

            queryParams['keyword'] = formValue;

            this.requestStoreGroup(queryParams);
        });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.totalStoreGroups$.next(null);
        this.totalStoreGroups$.complete();

        this.selectedStoreGroup$.next(null);
        this.selectedStoreGroup$.complete();

        this.isStoreGroupLoading$.next(null);
        this.isStoreGroupLoading$.complete();

        this.availableStoreGroups$.next(null);
        this.availableStoreGroups$.complete();
    }

    ngAfterViewInit(): void { }

}

