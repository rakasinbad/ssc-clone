import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input, ViewChild, AfterViewInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { fuseAnimations } from '@fuse/animations';
import { environment } from 'environments/environment';

import { FormControl } from '@angular/forms';
import { ErrorMessageService, HelperService } from 'app/shared/helpers';
import { MatAutocomplete, MatAutocompleteTrigger, MatAutocompleteSelectedEvent } from '@angular/material';
import { fromEvent, Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { tap, debounceTime, withLatestFrom, filter, takeUntil, startWith, distinctUntilChanged, take, catchError, switchMap } from 'rxjs/operators';
import { SegmentedStoreType as Entity } from './models';
import { SegmentedStoreTypesApiService as EntitiesApiService } from './services';
import { IQueryParams } from 'app/shared/models/query.model';
import { TNullable, IPaginatedResponse, ErrorHandler } from 'app/shared/models/global.model';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { UserSupplier } from 'app/shared/models/supplier.model';

@Component({
    selector: 'select-segmented-store-types',
    templateUrl: './segmented-store-types.component.html',
    styleUrls: ['./segmented-store-types.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SegmentedStoreTypesDropdownComponent implements OnInit, AfterViewInit, OnDestroy {

    // Form
    entityForm: FormControl = new FormControl('');
    // Subject untuk keperluan subscription.
    subs$: Subject<void> = new Subject<void>();

    // Untuk menyimpan Entity yang tersedia.
    availableEntities$: BehaviorSubject<Array<Entity>> = new BehaviorSubject<Array<Entity>>([]);
    // Subject untuk mendeteksi adanya perubahan Entity yang terpilih.
    selectedEntity$: BehaviorSubject<Entity> = new BehaviorSubject<Entity>(null);
    // Menyimpan state loading-nya Entity.
    isEntityLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    // Untuk menyimpan jumlah semua province.
    totalEntities$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    // Untuk mengirim data berupa lokasi yang telah terpilih.
    @Output() selected: EventEmitter<TNullable<Entity>> = new EventEmitter<TNullable<Entity>>();

    // Untuk keperluan AutoComplete-nya warehouse
    @ViewChild('entityAutoComplete', { static: true }) entityAutoComplete: MatAutocomplete;
    @ViewChild('triggerEntity', { static: true, read: MatAutocompleteTrigger }) triggerEntity: MatAutocompleteTrigger;

    constructor(
        private helper$: HelperService,
        private store: NgRxStore<fromAuth.FeatureState>,
        private errorMessage$: ErrorMessageService,
        private entityApi$: EntitiesApiService,
    ) {
        this.availableEntities$.pipe(
            tap(x => this.debug('AVAILABLE ENTITIES', x)),
            takeUntil(this.subs$)
        ).subscribe();

        this.selectedEntity$.pipe(
            tap(x => this.debug('SELECTED ENTITY', x)),
            takeUntil(this.subs$)
        ).subscribe(value => this.selected.emit(value));

        this.isEntityLoading$.pipe(
            tap(x => this.debug('IS ENTITY LOADING?', x)),
            takeUntil(this.subs$)
        ).subscribe();

        this.totalEntities$.pipe(
            tap(x => this.debug('TOTAL ENTITIES', x)),
            takeUntil(this.subs$)
        ).subscribe();
    }

    private toggleLoading(loading: boolean): void {
        this.isEntityLoading$.next(loading);
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

    private requestEntity(params: IQueryParams): void {
        of(null).pipe(
            // tap(x => this.debug('DELAY 1 SECOND BEFORE GET USER SUPPLIER FROM STATE', x)),
            // delay(1000),
            withLatestFrom<any, UserSupplier>(
                this.store.select<UserSupplier>(AuthSelectors.getUserSupplier)
            ),
            tap(x => this.debug('GET USER SUPPLIER FROM STATE', x)),
            switchMap<[null, UserSupplier], Observable<IPaginatedResponse<Entity>>>(([_, userSupplier]) => {
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
                return this.entityApi$
                    .find<IPaginatedResponse<Entity>>(newQuery)
                    .pipe(
                        tap(() => this.toggleLoading(true)),
                        tap(response => this.debug('FIND ENTITY', { params: newQuery, response }))
                    );
            }),
            take(1),
            catchError(err => { throw err; }),
        ).subscribe({
            next: (response) => {
                this.availableEntities$.next(response.data);
                this.totalEntities$.next(response.total);
            },
            error: (err) => {
                this.debug('ERROR FIND ENTITY', { params, error: err }),
                this.helper$.showErrorNotification(new ErrorHandler(err));
            },
            complete: () => {
                this.toggleLoading(false);
                this.debug('FIND ENTITY COMPLETED');
            }
        });
    }

    private initEntity(): void {
        // Menyiapkan query untuk pencarian store type.
        const params: IQueryParams = {
            paginate: true,
            limit: 10,
            skip: 0
        };

        // Reset form-nya store type.
        this.entityForm.enable();
        this.entityForm.reset();

        // Memulai request data store type.
        this.requestEntity(params);
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

    onSelectedEntity(event: MatAutocompleteSelectedEvent): void {
        // Mengambil nilai store type terpilih.
        const entity: Entity = event.option.value;
        // Mengirim nilai tersebut melalui subject.
        this.selectedEntity$.next(entity);
    }

    displayEntity(item: Entity): string {
        if (!item) {
            return;
        }

        return item.id;
    }

    processEntityAutoComplete(): void {
        if (this.triggerEntity && this.entityAutoComplete && this.entityAutoComplete.panel) {
            fromEvent<Event>(this.entityAutoComplete.panel.nativeElement, 'scroll')
                .pipe(
                    // Debugging.
                    tap(() => this.debug(`fromEvent<Event>(this.entityAutoComplete.panel.nativeElement, 'scroll')`)),
                    // Kasih jeda ketika scrolling.
                    debounceTime(500),
                    // Mengambil nilai terakhir store type yang tersedia, jumlah store type dan state loading-nya store type dari subject.
                    withLatestFrom(this.availableEntities$, this.totalEntities$, this.isEntityLoading$,
                        ($event, entities, totalEntities, isLoading) => ({ $event, entities, totalEntities, isLoading }),
                    ),
                    // Debugging.
                    tap(() => this.debug('SELECT ENTITY IS SCROLLING...', {})),
                    // Hanya diteruskan jika tidak sedang loading, jumlah di back-end > jumlah di state, dan scroll element sudah paling bawah.
                    filter(({ isLoading, entities, totalEntities }) =>
                        !isLoading && (totalEntities > entities.length) && this.helper$.isElementScrolledToBottom(this.entityAutoComplete.panel)
                    ),
                    takeUntil(this.triggerEntity.panelClosingActions.pipe(
                        tap(() => this.debug('SELECT ENTITY IS CLOSING ...'))
                    ))
                ).subscribe(({ entities }) => {
                    const params: IQueryParams = {
                        paginate: true,
                        limit: 10,
                        skip: entities.length
                    };

                    // Memulai request data store type.
                    this.requestEntity(params);
                });
        }
    }

    listenEntityAutoComplete(): void {
        // this.triggerEntity.autocomplete = this.entityAutoComplete;
        setTimeout(() => this.processEntityAutoComplete());
    }

    ngOnInit(): void {
        // Inisialisasi form sudah tidak ada karena sudah diinisialisasi saat deklarasi variabel.
        this.initEntity();

        // Menangani Form Control-nya warehouse.
        (this.entityForm.valueChanges).pipe(
            startWith(''),
            debounceTime(200),
            distinctUntilChanged(),
            withLatestFrom(this.selectedEntity$),
            filter(([formValue, selectedEntity]) => {
                if (selectedEntity && formValue && !this.entityAutoComplete.isOpen) {
                    return false;
                }
                
                if (selectedEntity || (!formValue && !this.entityAutoComplete.isOpen)) {
                    this.selectedEntity$.next(null);
                    return false;
                }

                if (!formValue && selectedEntity && !this.entityAutoComplete.isOpen) {
                    this.entityForm.patchValue(selectedEntity);
                    return false;
                }

                return true;
            }),
            tap<[string | Entity, TNullable<Entity>]>(([formValue, selectedEntity]) => {
                this.debug('ENTITY FORM VALUE IS CHANGED', { formValue, selectedEntity });
            }),
            takeUntil(this.subs$)
        ).subscribe(([formValue]) => {
            const queryParams: IQueryParams = {
                paginate: true,
                limit: 10,
                skip: 0
            };

            queryParams['keyword'] = formValue;

            this.requestEntity(queryParams);
        });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.totalEntities$.next(null);
        this.totalEntities$.complete();

        this.selectedEntity$.next(null);
        this.selectedEntity$.complete();

        this.isEntityLoading$.next(null);
        this.isEntityLoading$.complete();

        this.availableEntities$.next(null);
        this.availableEntities$.complete();
    }

    ngAfterViewInit(): void { }

}

