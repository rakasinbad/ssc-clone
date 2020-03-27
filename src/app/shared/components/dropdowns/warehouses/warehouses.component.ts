import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, Input, ViewChild, AfterViewInit, OnDestroy, EventEmitter, Output, SimpleChanges, OnChanges } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { fuseAnimations } from '@fuse/animations';
import { environment } from 'environments/environment';

import { FormControl } from '@angular/forms';
import { ErrorMessageService, HelperService } from 'app/shared/helpers';
import { MatAutocomplete, MatAutocompleteTrigger, MatAutocompleteSelectedEvent, MatOption } from '@angular/material';
import { fromEvent, Observable, Subject, BehaviorSubject, of, forkJoin } from 'rxjs';
import { tap, debounceTime, withLatestFrom, filter, takeUntil, map, startWith, distinctUntilChanged, delay, take, catchError, switchMap } from 'rxjs/operators';
import { Warehouse } from './models';
import { WarehouseApiService } from './services';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { IQueryParams } from 'app/shared/models/query.model';
import { TNullable, IPaginatedResponse, ErrorHandler } from 'app/shared/models/global.model';
import { fromAuth } from 'app/main/pages/core/auth/store/reducers';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { Auth } from 'app/main/pages/core/auth/models';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
    selector: 'select-warehouse',
    templateUrl: './warehouses.component.html',
    styleUrls: ['./warehouses.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseDropdownComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

    // Form
    warehouseForm: FormControl = new FormControl('');
    // Subject untuk keperluan subscription.
    subs$: Subject<void> = new Subject<void>();
    // Subject untuk keperluan toggle selection.
    toggle$: Subject<Warehouse | string> = new Subject<Warehouse | string>();

    // Untuk menyimpan warehouse yang tersedia.
    availableWarehouses$: BehaviorSubject<Array<Warehouse>> = new BehaviorSubject<Array<Warehouse>>([]);
    // Untuk menyimpan warehouse yang terpilih.
    selection: SelectionModel<Warehouse> = new SelectionModel<Warehouse>(true, []);
    // Subject untuk mendeteksi adanya perubahan warehouse yang terpilih.
    selectedWarehouse$: BehaviorSubject<Array<Warehouse>> = new BehaviorSubject<Array<Warehouse>>([]);
    // Menyimpan state loading-nya warehouse.
    isWarehouseLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    // Untuk menyimpan jumlah semua province.
    totalWarehouses$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    // Untuk penanda apakah semuanya terpilih atau tidak.
    // tslint:disable-next-line: no-inferrable-types
    allSelected: boolean = false;

    // Untuk menyimpan status required untuk input bersifat wajib atau tidak.
    // tslint:disable-next-line: no-inferrable-types
    @Input() isRequired: boolean = false;
    // Untuk mengirim data berupa lokasi yang telah terpilih.
    @Output() selected: EventEmitter<Array<Warehouse>> = new EventEmitter<Array<Warehouse>>();

    // Untuk keperluan AutoComplete-nya warehouse
    @ViewChild('invisibleOption', { static: true }) invisibleOption: MatOption;
    @ViewChild('warehouseAutoComplete', { static: true }) warehouseAutoComplete: MatAutocomplete;
    @ViewChild('triggerWarehouse', { static: true, read: MatAutocompleteTrigger }) triggerWarehouse: MatAutocompleteTrigger;

    constructor(
        private helper$: HelperService,
        private store: NgRxStore<fromAuth.FeatureState>,
        private errorMessage$: ErrorMessageService,
        private warehouseApi$: WarehouseApiService,
    ) {
        this.availableWarehouses$.pipe(
            tap(x => this.debug('AVAILABLE WAREHOUSES', x)),
            takeUntil(this.subs$)
        ).subscribe(warehouses => {
            if (this.allSelected) {
                this.selection.clear();
                warehouses.forEach(warehouse => this.selection.select(warehouse));
            }
        });

        this.selectedWarehouse$.pipe(
            tap(x => this.debug('SELECTED WAREHOUSE', x)),
            takeUntil(this.subs$)
        ).subscribe(warehouses => {
            this.selected.emit(warehouses);
        });

        this.isWarehouseLoading$.pipe(
            tap(x => this.debug('IS WAREHOUSE LOADING?', x)),
            takeUntil(this.subs$)
        ).subscribe();

        this.totalWarehouses$.pipe(
            tap(x => this.debug('TOTAL WAREHOUSES', x)),
            takeUntil(this.subs$)
        ).subscribe();

        this.toggle$.pipe(
            withLatestFrom(this.totalWarehouses$, this.availableWarehouses$),
            takeUntil(this.subs$)
        ).subscribe(([toggleValue, totalWarehouse, warehouses]) => {
            if (this.allSelected) {
                this.selection.clear();
            } else {
                warehouses.forEach(warehouse => this.selection.select(warehouse));
            }

            this.allSelected = !this.allSelected;
        });
    }

    private toggleLoading(loading: boolean): void {
        this.isWarehouseLoading$.next(loading);
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

    private requestWarehouse(params: IQueryParams): void {
        of(null).pipe(
            // tap(x => this.debug('DELAY 1 SECOND BEFORE GET USER SUPPLIER FROM STATE', x)),
            // delay(1000),
            withLatestFrom<any, UserSupplier>(
                this.store.select<UserSupplier>(AuthSelectors.getUserSupplier)
            ),
            tap(x => this.debug('GET USER SUPPLIER FROM STATE', x)),
            switchMap<[null, UserSupplier], Observable<IPaginatedResponse<Warehouse>>>(([_, userSupplier]) => {
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

                // Melakukan request data warehouse.
                return this.warehouseApi$
                    .find<IPaginatedResponse<Warehouse>>(newQuery)
                    .pipe(
                        tap(() => this.toggleLoading(true)),
                        tap(response => this.debug('FIND WAREHOUSE', { params: newQuery, response }))
                    );
            }),
            take(1),
            catchError(err => { throw err; }),
        ).subscribe({
            next: (response) => {
                this.availableWarehouses$.next(response.data);
                this.totalWarehouses$.next(response.total);
            },
            error: (err) => {
                this.debug('ERROR FIND WAREHOUSE', { params, error: err }),
                this.helper$.showErrorNotification(new ErrorHandler(err));
            },
            complete: () => {
                this.toggleLoading(false);
                this.debug('FIND WAREHOUSE COMPLETED');
            }
        });
    }

    private setValidator(): void {
        this.warehouseForm.setValidators(
            RxwebValidators.required({
                message: this.errorMessage$.getErrorMessageNonState(
                    'default',
                    'required'
                )
            })
        );
    }

    private initWarehouse(): void {
        // Menyiapkan query untuk pencarian warehouse.
        const params: IQueryParams = {
            paginate: true,
            limit: 10,
            skip: 0
        };

        // Reset form-nya warehouse.
        this.warehouseForm.enable();
        this.warehouseForm.reset();

        if (this.isRequired) {
            this.setValidator();
        }

        // Memulai request data warehouse.
        this.requestWarehouse(params);
    }

    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        return this.totalWarehouses$.value === numSelected;
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

    toggleSelectedWarehouse(warehouse: Warehouse): void {
        if (this.selection.isSelected(warehouse)) {
            if (this.allSelected) {
                this.allSelected = !this.allSelected;
            }

            this.selection.deselect(warehouse);
        } else {
            this.selection.select(warehouse);

            if (this.isAllSelected()) {
                this.allSelected = true;
            }
        }
    }

    onSelectedWarehouse(event: MatAutocompleteSelectedEvent): void {
        // Mengambil nilai warehouse terpilih.
        // const warehouse: Warehouse = event.option.value;
        // Mengirim nilai tersebut melalui subject.
        // this.selectedWarehouse$.next(warehouse);
    }

    displayWarehouse(): string {
        if (!this.selection) {
            return '';
        }

        if (!this.selection.hasValue()) {
            return '';
        }

        return this.selection.selected[0].name + String(this.selection.selected.length > 1 ? `(+${this.selection.selected.length - 1} others)` : '');
    }

    processWarehouseAutoComplete(): void {
        if (this.triggerWarehouse && this.warehouseAutoComplete && this.warehouseAutoComplete.panel) {
            fromEvent<Event>(this.warehouseAutoComplete.panel.nativeElement, 'scroll')
                .pipe(
                    // Debugging.
                    tap(() => this.debug(`fromEvent<Event>(this.warehouseAutoComplete.panel.nativeElement, 'scroll')`)),
                    // Kasih jeda ketika scrolling.
                    debounceTime(500),
                    // Mengambil nilai terakhir warehouse yang tersedia, jumlah warehouse dan state loading-nya warehouse dari subject.
                    withLatestFrom(this.availableWarehouses$, this.totalWarehouses$, this.isWarehouseLoading$,
                        ($event, warehouses, totalWarehouses, isLoading) => ({ $event, warehouses, totalWarehouses, isLoading }),
                    ),
                    // Debugging.
                    tap(() => this.debug('SELECT WAREHOUSE IS SCROLLING...', {})),
                    // Hanya diteruskan jika tidak sedang loading, jumlah di back-end > jumlah di state, dan scroll element sudah paling bawah.
                    filter(({ isLoading, warehouses, totalWarehouses }) =>
                        !isLoading && (totalWarehouses > warehouses.length) && this.helper$.isElementScrolledToBottom(this.warehouseAutoComplete.panel)
                    ),
                    takeUntil(this.triggerWarehouse.panelClosingActions)
                ).subscribe(({ warehouses }) => {
                    const params: IQueryParams = {
                        paginate: true,
                        limit: 10,
                        skip: warehouses.length
                    };

                    // Memulai request data warehouse.
                    this.requestWarehouse(params);
                });
        }
    }

    listenWarehouseAutoComplete(): void {
        this.warehouseForm.setValue('');
        setTimeout(() => this.processWarehouseAutoComplete(), 100);
    }

    optionSelected(event: Event, value: string | Warehouse): void {
        event.stopPropagation();
        this.toggle$.next(value);
    }

    ngOnInit(): void {
        // Inisialisasi form sudah tidak ada karena sudah diinisialisasi saat deklarasi variabel.
        this.initWarehouse();

        // Menangani Form Control-nya warehouse.
        (this.warehouseForm.valueChanges).pipe(
            startWith(''),
            debounceTime(200),
            distinctUntilChanged(),
            withLatestFrom(this.selectedWarehouse$),
            filter(([formValue, selectedWarehouse]) => {
                if (selectedWarehouse && formValue && !this.warehouseAutoComplete.isOpen) {
                    return false;
                }

                if (selectedWarehouse || (!formValue && !this.warehouseAutoComplete.isOpen)) {
                    this.selectedWarehouse$.next(null);
                    return false;
                }

                if (!formValue && selectedWarehouse && !this.warehouseAutoComplete.isOpen) {
                    this.warehouseForm.patchValue(selectedWarehouse);
                    return false;
                }

                return true;
            }),
            tap<[string | Warehouse, Array<Warehouse>]>(([formValue, selectedWarehouse]) => {
                this.debug('WAREHOUSE FORM VALUE IS CHANGED', { formValue, selectedWarehouse });
            }),
            takeUntil(this.subs$)
        ).subscribe(([formValue]) => {
            const queryParams: IQueryParams = {
                paginate: true,
                limit: 10,
                skip: 0
            };

            queryParams['keyword'] = formValue;

            this.requestWarehouse(queryParams);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isRequired']) {
            this.warehouseForm.clearValidators();

            if (changes['isRequired'].currentValue === true) {
                this.setValidator();
            }

            this.warehouseForm.updateValueAndValidity();
        }
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();

        this.totalWarehouses$.next(null);
        this.totalWarehouses$.complete();

        this.selectedWarehouse$.next(null);
        this.selectedWarehouse$.complete();

        this.isWarehouseLoading$.next(null);
        this.isWarehouseLoading$.complete();

        this.availableWarehouses$.next(null);
        this.availableWarehouses$.complete();
    }

    ngAfterViewInit(): void {
        this.triggerWarehouse.panelClosingActions.pipe(
            startWith([]),
            tap(() => this.debug('SELECT WAREHOUSE IS CLOSING ...'))
        ).subscribe(() => {
            this.selectedWarehouse$.next(this.selection.selected);

            if (!this.selection) {
                this.warehouseForm.setValue('');
                return;
            }

            if (!this.selection.hasValue()) {
                this.warehouseForm.setValue('');
                return;
            }

            const selectedFirst = this.selection.selected[0].name;
            const selectedLength = this.selection.selected.length;
            this.warehouseForm.setValue(this.warehouseForm.value + ' ');
            setTimeout(() =>
                this.warehouseForm.setValue(selectedFirst + String(selectedLength > 1 ? ` (+${selectedLength - 1} ${selectedLength <= 1 ? 'other' : 'others'})` : ''))
            );
        });
    }

}

