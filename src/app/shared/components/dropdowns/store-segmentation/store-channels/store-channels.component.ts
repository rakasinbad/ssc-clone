import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input, ViewChild, AfterViewInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { fuseAnimations } from '@fuse/animations';
import { environment } from 'environments/environment';

import { FormControl } from '@angular/forms';
import { ErrorMessageService, HelperService } from 'app/shared/helpers';
import { MatAutocomplete, MatAutocompleteTrigger, MatAutocompleteSelectedEvent } from '@angular/material';
import { fromEvent, Observable, Subject, BehaviorSubject, of, forkJoin } from 'rxjs';
import { tap, debounceTime, withLatestFrom, filter, takeUntil, map, startWith, distinctUntilChanged, delay, take, catchError, switchMap } from 'rxjs/operators';
import { StoreChannel } from './models';
import { StoreChannelsApiService } from './services';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { IQueryParams } from 'app/shared/models/query.model';
import { TNullable, IPaginatedResponse, ErrorHandler } from 'app/shared/models/global.model';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { Auth } from 'app/main/pages/core/auth/models';

@Component({
    selector: 'select-store-channels',
    templateUrl: './store-channels.component.html',
    styleUrls: ['./store-channels.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreChannelsDropdownComponent implements OnInit, AfterViewInit, OnDestroy {

    // Form
    storeChannelForm: FormControl = new FormControl('');
    // Subject untuk keperluan subscription.
    subs$: Subject<void> = new Subject<void>();

    // Untuk menyimpan StoreChannel yang tersedia.
    availableStoreChannels$: BehaviorSubject<Array<StoreChannel>> = new BehaviorSubject<Array<StoreChannel>>([]);
    // Subject untuk mendeteksi adanya perubahan StoreChannel yang terpilih.
    selectedStoreChannel$: BehaviorSubject<StoreChannel> = new BehaviorSubject<StoreChannel>(null);
    // Menyimpan state loading-nya StoreChannel.
    isStoreChannelLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    // Untuk menyimpan jumlah semua province.
    totalStoreChannels$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    // Untuk mengirim data berupa lokasi yang telah terpilih.
    @Output() selected: EventEmitter<TNullable<StoreChannel>> = new EventEmitter<TNullable<StoreChannel>>();

    // Untuk keperluan AutoComplete-nya warehouse
    @ViewChild('storeChannelAutoComplete', { static: true }) storeChannelAutoComplete: MatAutocomplete;
    @ViewChild('triggerStoreChannel', { static: true, read: MatAutocompleteTrigger }) triggerStoreChannel: MatAutocompleteTrigger;

    constructor(
        private helper$: HelperService,
        private store: NgRxStore<fromAuth.FeatureState>,
        private errorMessage$: ErrorMessageService,
        private storeChannelApi$: StoreChannelsApiService,
    ) {
        this.availableStoreChannels$.pipe(
            tap(x => this.debug('AVAILABLE STORE CHANNELS', x)),
            takeUntil(this.subs$)
        ).subscribe();

        this.selectedStoreChannel$.pipe(
            tap(x => this.debug('SELECTED STORE CHANNEL', x)),
            takeUntil(this.subs$)
        ).subscribe();

        this.isStoreChannelLoading$.pipe(
            tap(x => this.debug('IS STORE CHANNEL LOADING?', x)),
            takeUntil(this.subs$)
        ).subscribe();

        this.totalStoreChannels$.pipe(
            tap(x => this.debug('TOTAL STORE CHANNELS', x)),
            takeUntil(this.subs$)
        ).subscribe();
    }

    private toggleLoading(loading: boolean): void {
        this.isStoreChannelLoading$.next(loading);
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

    private requestStoreChannel(params: IQueryParams): void {
        of(null).pipe(
            // tap(x => this.debug('DELAY 1 SECOND BEFORE GET USER SUPPLIER FROM STATE', x)),
            // delay(1000),
            withLatestFrom<any, UserSupplier>(
                this.store.select<UserSupplier>(AuthSelectors.getUserSupplier)
            ),
            tap(x => this.debug('GET USER SUPPLIER FROM STATE', x)),
            switchMap<[null, UserSupplier], Observable<IPaginatedResponse<StoreChannel>>>(([_, userSupplier]) => {
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
                return this.storeChannelApi$
                    .find<IPaginatedResponse<StoreChannel>>(newQuery)
                    .pipe(
                        tap(() => this.toggleLoading(true)),
                        tap(response => this.debug('FIND STORE CHANNEL', { params: newQuery, response }))
                    );
            }),
            take(1),
            catchError(err => { throw err; }),
        ).subscribe({
            next: (response) => {
                this.availableStoreChannels$.next(response.data);
                this.totalStoreChannels$.next(response.total);
            },
            error: (err) => {
                this.debug('ERROR FIND STORE CHANNEL', { params, error: err }),
                this.helper$.showErrorNotification(new ErrorHandler(err));
            },
            complete: () => {
                this.toggleLoading(false);
                this.debug('FIND STORE CHANNEL COMPLETED');
            }
        });
    }

    private initStoreChannel(): void {
        // Menyiapkan query untuk pencarian store channel.
        const params: IQueryParams = {
            paginate: true,
            limit: 10,
            skip: 0
        };

        // Reset form-nya store channel.
        this.storeChannelForm.enable();
        this.storeChannelForm.reset();

        // Memulai request data store channel.
        this.requestStoreChannel(params);
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

    onSelectedStoreChannel(event: MatAutocompleteSelectedEvent): void {
        // Mengambil nilai store channel terpilih.
        const storeChannel: StoreChannel = event.option.value;
        // Mengirim nilai tersebut melalui subject.
        this.selectedStoreChannel$.next(storeChannel);
    }

    displayStoreChannel(item: StoreChannel): string {
        if (!item) {
            return;
        }

        return item.name;
    }

    processStoreChannelAutoComplete(): void {
        if (this.triggerStoreChannel && this.storeChannelAutoComplete && this.storeChannelAutoComplete.panel) {
            fromEvent<Event>(this.storeChannelAutoComplete.panel.nativeElement, 'scroll')
                .pipe(
                    // Debugging.
                    tap(() => this.debug(`fromEvent<Event>(this.storeChannelAutoComplete.panel.nativeElement, 'scroll')`)),
                    // Kasih jeda ketika scrolling.
                    debounceTime(500),
                    // Mengambil nilai terakhir store channel yang tersedia, jumlah store channel dan state loading-nya store channel dari subject.
                    withLatestFrom(this.availableStoreChannels$, this.totalStoreChannels$, this.isStoreChannelLoading$,
                        ($event, storeChannels, totalStoreChannels, isLoading) => ({ $event, storeChannels, totalStoreChannels, isLoading }),
                    ),
                    // Debugging.
                    tap(() => this.debug('SELECT STORE CHANNEL IS SCROLLING...', {})),
                    // Hanya diteruskan jika tidak sedang loading, jumlah di back-end > jumlah di state, dan scroll element sudah paling bawah.
                    filter(({ isLoading, storeChannels, totalStoreChannels }) =>
                        !isLoading && (totalStoreChannels > storeChannels.length) && this.helper$.isElementScrolledToBottom(this.storeChannelAutoComplete.panel)
                    ),
                    takeUntil(this.triggerStoreChannel.panelClosingActions.pipe(
                        tap(() => this.debug('SELECT STORE CHANNEL IS CLOSING ...'))
                    ))
                ).subscribe(({ storeChannels }) => {
                    const params: IQueryParams = {
                        paginate: true,
                        limit: 10,
                        skip: storeChannels.length
                    };

                    // Memulai request data store channel.
                    this.requestStoreChannel(params);
                });
        }
    }

    listenStoreChannelAutoComplete(): void {
        // this.triggerStoreChannel.autocomplete = this.storeChannelAutoComplete;
        setTimeout(() => this.processStoreChannelAutoComplete());
    }

    ngOnInit(): void {
        // Inisialisasi form sudah tidak ada karena sudah diinisialisasi saat deklarasi variabel.
        this.initStoreChannel();

        // Menangani Form Control-nya warehouse.
        (this.storeChannelForm.valueChanges).pipe(
            startWith(''),
            debounceTime(200),
            distinctUntilChanged(),
            withLatestFrom(this.selectedStoreChannel$),
            filter(([formValue, selectedStoreChannel]) => {
                if (selectedStoreChannel && formValue && !this.storeChannelAutoComplete.isOpen) {
                    return false;
                }
                
                if (selectedStoreChannel || (!formValue && !this.storeChannelAutoComplete.isOpen)) {
                    this.selectedStoreChannel$.next(null);
                    return false;
                }

                if (!formValue && selectedStoreChannel && !this.storeChannelAutoComplete.isOpen) {
                    this.storeChannelForm.patchValue(selectedStoreChannel);
                    return false;
                }

                return true;
            }),
            tap<[string | StoreChannel, TNullable<StoreChannel>]>(([formValue, selectedStoreChannel]) => {
                this.debug('STORE CHANNEL FORM VALUE IS CHANGED', { formValue, selectedStoreChannel });
            }),
            takeUntil(this.subs$)
        ).subscribe(([formValue]) => {
            const queryParams: IQueryParams = {
                paginate: true,
                limit: 10,
                skip: 0
            };

            queryParams['keyword'] = formValue;

            this.requestStoreChannel(queryParams);
        });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.totalStoreChannels$.next(null);
        this.totalStoreChannels$.complete();

        this.selectedStoreChannel$.next(null);
        this.selectedStoreChannel$.complete();

        this.isStoreChannelLoading$.next(null);
        this.isStoreChannelLoading$.complete();

        this.availableStoreChannels$.next(null);
        this.availableStoreChannels$.complete();
    }

    ngAfterViewInit(): void { }

}

