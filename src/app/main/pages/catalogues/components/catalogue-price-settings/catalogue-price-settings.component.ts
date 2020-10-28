import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatPaginator, MatSort, PageEvent } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { Selection } from 'app/shared/components/dropdowns/select-advanced/models';
import { Warehouse } from 'app/shared/components/dropdowns/warehouses/models';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { DeleteConfirmationComponent } from 'app/shared/modals';
import { FormStatus } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { environment } from 'environments/environment';
import { BehaviorSubject, combineLatest, Observable, Subject, Subscription } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    map,
    take,
    takeUntil,
    tap,
    withLatestFrom,
} from 'rxjs/operators';
import { Catalogue } from '../../models';
import { CataloguePrice } from '../../models/catalogue-price.model';
import { CatalogueFacadeService, CataloguesService } from '../../services';
import { CatalogueActions } from '../../store/actions';
import { fromCatalogue } from '../../store/reducers';
import { CatalogueSelectors } from '../../store/selectors';

type IFormMode = 'add' | 'view' | 'edit';

@Component({
    selector: 'catalogue-price-settings',
    templateUrl: './catalogue-price-settings.component.html',
    styleUrls: ['./catalogue-price-settings.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CataloguePriceSettingsComponent
    implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    private trigger$: BehaviorSubject<string> = new BehaviorSubject('');
    private subs: Subscription = new Subscription();
    // Untuk keperluan subscription.
    private unSubs$: Subject<any> = new Subject();
    // Untuk keperluan memicu adanya perubahan view.
    private updateForm$: BehaviorSubject<IFormMode> = new BehaviorSubject<IFormMode>(null);
    private selectedCatalogue$: BehaviorSubject<Catalogue> = new BehaviorSubject<Catalogue>(null);

    defaultPageSizeTable: Array<number> = environment.pageSizeTable;

    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    selectedCatalogueId: number;

    // Untuk form.
    form: FormGroup;
    filterForm: FormGroup;
    // Untuk meneriman input untuk mengubah mode form dari luar komponen ini.
    formModeValue: IFormMode = 'add';
    // Untuk mendapatkan nilai status loading dari state-nya catalogue.
    isLoading$: Observable<boolean>;
    // Untuk menyimpan price settings-nya catalogue.
    cataloguePrices$: Observable<CataloguePrice[]>;
    // Untuk menyimpan jumlah price setting-nya catalogue yang tersedia di back-end.
    totalCataloguePrice$: Observable<number>;
    // Untuk menyimpan kolom tabel yang ingin dimunculkan.
    displayedColumns: string[] = [
        'warehouse',
        'storeType',
        'storeGroup',
        'storeChannel',
        'storeCluster',
        'price',
    ];

    catalogueContent: {
        'content-card': boolean;
        'mt-16': boolean;
        'sinbad-content': boolean;
        'mat-elevation-z1': boolean;
        'fuse-white': boolean;
    };

    formClass: {
        'custom-field-right': boolean;
        'custom-field': boolean;
        'view-field-right': boolean;
    };

    cataloguePriceTools: string[] = ['warehouse', 'type', 'group', 'channel', 'cluster'];

    @Output()
    formStatusChange: EventEmitter<FormStatus> = new EventEmitter();

    @Output()
    formValueChange: EventEmitter<Catalogue> = new EventEmitter();

    @Output()
    changePage: EventEmitter<void> = new EventEmitter();

    // Untuk mendapatkan event ketika form mode berubah.
    @Output()
    formModeChange: EventEmitter<IFormMode> = new EventEmitter();

    @Input()
    get formMode(): IFormMode {
        return this.formModeValue;
    }

    set formMode(mode: IFormMode) {
        this.formModeValue = mode;
        this.formModeChange.emit(this.formModeValue);
    }

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef<HTMLElement>;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('filter', { static: true })
    filter: ElementRef;

    constructor(
        private cdRef: ChangeDetectorRef,
        private fb: FormBuilder,
        private notice$: NoticeService,
        private route: ActivatedRoute,
        private router: Router,
        private dialog: MatDialog,
        private catalogueFacade: CatalogueFacadeService,
        private store: NgRxStore<fromCatalogue.FeatureState>,
        private catalogue$: CataloguesService,
        private errorMessage$: ErrorMessageService
    ) {
        const { id } = this.route.snapshot.params;
        this.selectedCatalogueId = id;

        this.cataloguePrices$ = this.store
            .select(CatalogueSelectors.getCataloguePriceSettings)
            .pipe(
                map((cataloguePrices) =>
                    cataloguePrices.map((cataloguePrice) => {
                        const newCataloguePrice: CataloguePrice = {
                            ...cataloguePrice,
                            price: (String(cataloguePrice.price).replace(
                                '.',
                                ','
                            ) as unknown) as number,
                        };

                        return new CataloguePrice(newCataloguePrice);
                    })
                ),
                tap(() => {
                    if (this.formModeValue === 'edit') {
                        this.updateForm$.next(this.formModeValue);
                    }
                }),
                takeUntil(this.unSubs$)
            );

        this.totalCataloguePrice$ = this.store
            .select(CatalogueSelectors.getTotalCataloguePriceSettings)
            .pipe(
                tap((value) => this.form.get('advancePrice').setValue(value > 0)),
                takeUntil(this.unSubs$)
            );

        this.isLoading$ = this.store
            .select(CatalogueSelectors.getIsLoading)
            .pipe(takeUntil(this.unSubs$));

        this.catalogue$
            .getUpdateForm()
            .pipe(
                tap((value) => HelperService.debug('UPDATE FORM CHANGED', value)),
                takeUntil(this.unSubs$)
            )
            .subscribe((value) => {
                if (value) {
                    const formControl = this.form.get(['priceSettings', value, 'price']);

                    formControl.enable({ onlySelf: true, emitEvent: false });
                    formControl.markAsPristine();
                    formControl.markAsUntouched();
                }
            });

        this.store
            .select(CatalogueSelectors.getRefreshStatus)
            .pipe(takeUntil(this.unSubs$))
            .subscribe((needRefresh) => {
                if (needRefresh) {
                    this.onApplyFilter();
                }

                this.store.dispatch(CatalogueActions.setRefreshStatus({ status: false }));
            });
    }

    drop(event: CdkDragDrop<Array<string>>): void {
        // this.cataloguePriceTools.
        moveItemInArray(this.cataloguePriceTools, event.previousIndex, event.currentIndex);
    }

    private prepareEditCatalogue(): void {
        combineLatest([
            this.store.select(CatalogueSelectors.getSelectedCatalogueEntity),
            this.store.select(AuthSelectors.getUserSupplier),
        ])
            .pipe(withLatestFrom(this.cataloguePrices$), takeUntil(this.unSubs$))
            .subscribe(
                ([[catalogue, userSupplier], cataloguePrices]: [
                    [Catalogue, UserSupplier],
                    Array<CataloguePrice>
                ]) => {
                    /** Mengambil ID dari URL (untuk jaga-jaga ketika ID katalog yang terpilih tidak ada di state) */
                    const { id } = this.route.snapshot.params;

                    /** Butuh mengambil data katalog jika belum ada di state. */
                    if (!catalogue) {
                        this.store.dispatch(
                            CatalogueActions.fetchCatalogueRequest({
                                payload: id,
                            })
                        );

                        this.store.dispatch(
                            CatalogueActions.setSelectedCatalogue({
                                payload: id,
                            })
                        );

                        return;
                    }

                    if (cataloguePrices.length === 0) {
                        const query: IQueryParams = {
                            paginate: true,
                            limit: environment.pageSize,
                            skip: 0,
                        };

                        query['catalogueId'] = catalogue.id;
                        query['warehouseIds'] = [];
                        query['typeIds'] = [];
                        query['groupIds'] = [];
                        query['channelIds'] = [];
                        query['clusterIds'] = [];

                        this.store.dispatch(
                            CatalogueActions.fetchCataloguePriceSettingsRequest({
                                payload: query,
                            })
                        );
                    }

                    /** Harus keluar dari halaman form jika katalog yang diproses bukan milik supplier tersebut. */
                    if ((catalogue.brand as any).supplierId !== userSupplier.supplierId) {
                        this.store.dispatch(
                            CatalogueActions.spliceCatalogue({
                                payload: id,
                            })
                        );

                        this.notice$.open('Produk tidak ditemukan.', 'error', {
                            verticalPosition: 'bottom',
                            horizontalPosition: 'right',
                        });

                        setTimeout(
                            () => this.router.navigate(['pages', 'catalogues', 'list']),
                            1000
                        );

                        return;
                    }

                    if (this.isViewMode()) {
                        this.form.get('advancePrice').disable();
                    } else {
                        this.form.get('advancePrice').enable();
                    }

                    /** Pemberian jeda untuk memasukkan data katalog ke dalam form. */
                    this.form.patchValue({
                        id: catalogue.id,
                        supplierId: (catalogue.brand as any).supplierId,
                        retailBuyingPrice: String(catalogue.retailBuyingPrice).replace('.', ','),
                        retailBuyingPriceView: catalogue.retailBuyingPrice,
                        discountRetailBuyerPrice: String(
                            catalogue.discountedRetailBuyingPrice
                        ).replace('.', ','),
                        discountRetailBuyerPriceView: catalogue.discountedRetailBuyingPrice,
                    });

                    // this.cdRef.markForCheck();

                    this.selectedCatalogue$.next(catalogue);

                    /** Melakukan trigger pada form agar mengeluarkan pesan error jika belum ada yang terisi pada nilai wajibnya. */
                    this.form.markAsDirty({ onlySelf: false });
                    this.form.markAllAsTouched();
                    this.form.markAsPristine();
                }
            );
    }

    private initFormCheck(): void {
        // (this.form.statusChanges as Observable<FormStatus>).pipe(
        //     distinctUntilChanged(),
        //     debounceTime(100),
        //     tap(value => HelperService.debug('CATALOGUE PRICE SETTINGS FORM STATUS CHANGED:', value)),
        //     takeUntil(this.unSubs$)
        // ).subscribe(status => {
        //     this.formStatusChange.emit(status);
        // });

        this.form
            .get('retailBuyingPrice')
            .valueChanges.pipe(
                distinctUntilChanged(),
                debounceTime(100),
                tap((value) =>
                    HelperService.debug(
                        'CATALOGUE PRICE SETTINGS -> RETAIL BUYING PRICE FORM VALUE CHANGED',
                        value
                    )
                ),
                takeUntil(this.unSubs$)
            )
            .subscribe((value) => {
                this.formValueChange.emit({ retailBuyingPrice: value } as Catalogue);
            });

        this.form
            .get('retailBuyingPrice')
            .statusChanges.pipe(
                distinctUntilChanged(),
                debounceTime(100),
                tap((status) =>
                    HelperService.debug(
                        'CATALOGUE PRICE SETTINGS -> RETAIL BUYING PRICE FORM STATUS CHANGED',
                        status
                    )
                ),
                takeUntil(this.unSubs$)
            )
            .subscribe((status) => {
                this.formStatusChange.emit(status);
            });

        this.updateForm$
            .pipe(
                tap((formMode) =>
                    HelperService.debug('CATALOGUE PRICE SETTINGS FORM MODE CHANGED:', formMode)
                ),
                withLatestFrom(this.cataloguePrices$),
                takeUntil(this.unSubs$)
            )
            .subscribe(([formMode, cataloguePrices]) => {
                this.subs.unsubscribe();
                this.subs = new Subscription();

                if (formMode === 'edit') {
                    (this.form.get('priceSettings') as FormArray).clear();

                    for (const [idx, cataloguePrice] of cataloguePrices.entries()) {
                        const control = this.fb.group({
                            id: [cataloguePrice.id],
                            price: [
                                cataloguePrice.price,
                                {
                                    validators: [
                                        RxwebValidators.required({
                                            message: this.errorMessage$.getErrorMessageNonState(
                                                'default',
                                                'required'
                                            ),
                                        }),
                                    ],
                                    updateOn: 'blur',
                                },
                            ],
                        });

                        (this.form.get('priceSettings') as FormArray).push(control);

                        const sub = control
                            .get('price')
                            .valueChanges.pipe(
                                distinctUntilChanged(),
                                debounceTime(100),
                                tap((value) =>
                                    HelperService.debug(
                                        'CATALOGUE PRICE SETTINGS FORM VALUE CHANGED',
                                        value
                                    )
                                )
                            )
                            .subscribe((value) => {
                                if (value !== '0.00' || value) {
                                    control.disable();

                                    const priceSettingId = control.get('id').value;

                                    this.store.dispatch(
                                        CatalogueActions.updateCataloguePriceSettingRequest({
                                            payload: {
                                                priceSettingId,
                                                price: value,
                                                formIndex: idx,
                                            },
                                        })
                                    );

                                    // this.cdRef.markForCheck();
                                }
                            });

                        this.subs.add(sub);
                    }

                    this.form.updateValueAndValidity();
                }

                this._updateFormView();
            });
    }

    getFormError(form: any): string {
        return this.errorMessage$.getFormError(form);
    }

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

    isAddMode(): boolean {
        return this.formMode === 'add';
    }

    isEditMode(): boolean {
        return this.formMode === 'edit';
    }

    isViewMode(): boolean {
        return this.formMode === 'view';
    }

    onSelectedWarehouses($event: Array<Warehouse>): void {
        HelperService.debug('onSelectedWarehouses', $event);

        if ($event && Array.isArray($event)) {
            this.filterForm.get('warehouses').setValue($event.map((e) => e.id));
        }
    }

    onSelectedStoreSegmentationTypes($event: Array<Selection>): void {
        HelperService.debug('onSelectedStoreSegmentationTypes', $event);
        this.filterForm.get('storeType').setValue($event.map((e) => e.id));
    }

    onSelectedStoreSegmentationGroup($event: Array<Selection>): void {
        HelperService.debug('onSelectedStoreSegmentationGroup', $event);
        this.filterForm.get('storeGroup').setValue($event.map((e) => e.id));
    }

    onSelectedStoreSegmentationChannel($event: Array<Selection>): void {
        HelperService.debug('onSelectedStoreSegmentationChannel', $event);
        this.filterForm.get('storeChannel').setValue($event.map((e) => e.id));
    }

    onSelectedStoreSegmentationCluster($event: Array<Selection>): void {
        HelperService.debug('onSelectedStoreSegmentationCluster', $event);
        this.filterForm.get('storeCluster').setValue($event.map((e) => e.id));
    }

    onApplyPriceToAll(): void {
        const priceValue = this.form.get('priceToAll').value;

        if (!priceValue || priceValue === '0.00') {
            this.notice$.open('Input the price value.', 'error', {
                horizontalPosition: 'right',
                verticalPosition: 'bottom',
                duration: 5000,
            });
        } else {
            const dialogRef = this.dialog.open<DeleteConfirmationComponent, any, string>(
                DeleteConfirmationComponent,
                {
                    data: {
                        id: 'apply-price-to-all',
                        title: 'Clear',
                        message: `It will apply to the price settings which based on your filter.
                        Are you sure want to proceed?`,
                    },
                    disableClose: true,
                }
            );

            dialogRef
                .afterClosed()
                .pipe(tap((value) => HelperService.debug('APPLY WARNING DIALOG CLOSED', value)))
                .subscribe((value) => {
                    if (value === 'apply-price-to-all') {
                        const data = {};
                        const filterFormValue = this.filterForm.getRawValue();

                        if (Array.isArray(filterFormValue.warehouses)) {
                            data['warehouseCatalogueId'] =
                                filterFormValue.warehouses.length === 0
                                    ? 'all'
                                    : filterFormValue.warehouses;
                        } else {
                            data['warehouseCatalogueId'] = 'all';
                        }

                        if (Array.isArray(filterFormValue.storeType)) {
                            data['typeIds'] =
                                filterFormValue.storeType.length === 0
                                    ? 'all'
                                    : filterFormValue.storeType;
                        } else {
                            data['typeIds'] = 'all';
                        }

                        if (Array.isArray(filterFormValue.storeGroup)) {
                            data['groupIds'] =
                                filterFormValue.storeGroup.length === 0
                                    ? 'all'
                                    : filterFormValue.storeGroup;
                        } else {
                            data['groupIds'] = 'all';
                        }

                        if (Array.isArray(filterFormValue.storeChannel)) {
                            data['channelIds'] =
                                filterFormValue.storeChannel.length === 0
                                    ? 'all'
                                    : filterFormValue.storeChannel;
                        } else {
                            data['channelIds'] = 'all';
                        }

                        if (Array.isArray(filterFormValue.storeCluster)) {
                            data['clusterIds'] =
                                filterFormValue.storeCluster.length === 0
                                    ? 'all'
                                    : filterFormValue.storeCluster;
                        } else {
                            data['clusterIds'] = 'all';
                        }

                        this.store.dispatch(
                            CatalogueActions.applyFilteredCataloguePriceRequest({
                                payload: {
                                    catalogueId: this.form.get('id').value,
                                    supplierId: this.form.get('supplierId').value,
                                    price: this.form.get('priceToAll').value,
                                    warehouseCatalogueId: data['warehouseCatalogueId'],
                                    typeId: data['typeIds'],
                                    groupId: data['groupIds'],
                                    channelId: data['channelIds'],
                                    clusterId: data['clusterIds'],
                                },
                            })
                        );
                    }
                });
        }
    }

    onApplyFilter(): void {
        HelperService.debug('onApplyFilter', {});
        this.updateForm$.next(null);

        const filterFormValue = this.filterForm.getRawValue();

        const data: IQueryParams = {
            limit: this.paginator.pageSize,
            skip: this.paginator.pageSize * this.paginator.pageIndex,
        };

        data['paginate'] = true;
        data['catalogueId'] = this.selectedCatalogue$.value.id;

        if (Array.isArray(filterFormValue.warehouses)) {
            data['warehouseIds'] = filterFormValue.warehouses;
        } else {
            data['warehouseIds'] = [];
        }

        if (Array.isArray(filterFormValue.storeType)) {
            data['typeIds'] = filterFormValue.storeType;
        } else {
            data['typeIds'] = [];
        }

        if (Array.isArray(filterFormValue.storeGroup)) {
            data['groupIds'] = filterFormValue.storeGroup;
        } else {
            data['groupIds'] = [];
        }

        if (Array.isArray(filterFormValue.storeChannel)) {
            data['channelIds'] = filterFormValue.storeChannel;
        } else {
            data['channelIds'] = [];
        }

        if (Array.isArray(filterFormValue.storeCluster)) {
            data['clusterIds'] = filterFormValue.storeCluster;
        } else {
            data['clusterIds'] = [];
        }

        this.store.dispatch(
            CatalogueActions.fetchCataloguePriceSettingsRequest({
                payload: data,
            })
        );
    }

    onChangePage(ev: PageEvent): void {
        HelperService.debug('onChangePage', ev);
        this.updateForm$.next(null);
        this.changePage.emit();

        const data: IQueryParams = {
            limit: this.paginator.pageSize,
            skip: this.paginator.pageSize * this.paginator.pageIndex,
        };

        data['paginate'] = true;
        data['catalogueId'] = this.selectedCatalogue$.value.id;
        data['warehouseIds'] = [];
        data['typeIds'] = [];
        data['groupIds'] = [];
        data['channelIds'] = [];
        data['clusterIds'] = [];

        //         if (this.sort.direction) {
        //             data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
        //             data['sortBy'] = this.sort.active;
        //         }

        this.store.dispatch(
            CatalogueActions.fetchCataloguePriceSettingsRequest({
                payload: data,
            })
        );

        // this.table.nativeElement.scrollIntoView();
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            id: null,
            supplierId: null,
            discountRetailBuyerPrice: null,
            discountRetailBuyerPriceView: null,
            retailBuyingPrice: [
                '',
                [
                    RxwebValidators.required({
                        message: this.errorMessage$.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            retailBuyingPriceView: null,
            priceToAll: null,
            priceSettings: this.fb.array([]),
            advancePrice: false,
        });

        this.filterForm = this.fb.group({
            warehouses: [''],
            storeType: [''],
            storeGroup: [''],
            storeChannel: [''],
            storeCluster: [''],
        });

        this._checkRoute();
        this.initFormCheck();

        if (this.formMode === 'view' || this.formMode === 'edit') {
            this._patchForm();
        }
    }

    ngAfterViewInit(): void {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['formMode']) {
            if (
                (!changes['formMode'].isFirstChange() &&
                    changes['formMode'].currentValue === 'edit') ||
                changes['formMode'].currentValue === 'view'
            ) {
                this.trigger$.next('');
                this.updateForm$.next(changes['formMode'].currentValue);
            }
        }

        // Need review
        /* if (!changes['formMode'].isFirstChange() && changes['formMode'].currentValue === 'edit') {
            this.updateForm$.next(changes['formMode'].currentValue);
        } else if (changes['formMode'].currentValue) {
            this.updateForm$.next(changes['formMode'].currentValue);
        } */
    }

    ngOnDestroy(): void {
        this.unSubs$.next();
        this.unSubs$.complete();

        this.updateForm$.next(null);
        this.updateForm$.complete();

        if (!this.subs.closed) {
            this.subs.unsubscribe();
        }

        this.store.dispatch(CatalogueActions.resetCataloguePriceSettings());
    }

    private _checkRoute(): void {
        this.route.url.pipe(take(1)).subscribe((urls) => {
            if (urls.filter((url) => url.path === 'edit').length > 0) {
                this.formMode = 'edit';
                this.prepareEditCatalogue();
            } else if (urls.filter((url) => url.path === 'view').length > 0) {
                this.formMode = 'view';
                this.prepareEditCatalogue();
            } else if (urls.filter((url) => url.path === 'add').length > 0) {
                this.formMode = 'add';
            }

            this._updateFormView();
        });
    }

    private _patchForm(): void {
        combineLatest([this.trigger$, this.catalogueFacade.catalogue$])
            .pipe(
                map(([_, catalogue]) => ({ catalogue })),
                filter(({ catalogue }) => !!catalogue),
                takeUntil(this.unSubs$)
            )
            .subscribe(({ catalogue: item }) => {
                // console.log('PATCH', {
                //     item,
                //     form: this.form,
                //     formPrice: this.form.get('priceSettings'),
                // });
            });
    }

    private _updateFormView(): void {
        this.formClass = {
            'custom-field-right': !this.isViewMode(),
            'custom-field': !this.isViewMode(),
            'view-field-right': this.isViewMode(),
        };

        this.catalogueContent = {
            'mt-16': true,
            'content-card': this.isViewMode(),
            'sinbad-content': this.isAddMode() || this.isEditMode(),
            'mat-elevation-z1': this.isAddMode() || this.isEditMode(),
            'fuse-white': this.isAddMode() || this.isEditMode(),
        };

        if (this.isViewMode()) {
            this.form.get('advancePrice').disable();
        } else {
            this.form.get('advancePrice').enable();
        }

        // setTimeout(() => {
        //     const catalogue = this.selectedCatalogue$.value;
        //     this.form.get('retailBuyingPrice').setValue(this.isViewMode() ? catalogue.retailBuyingPrice : String(catalogue.retailBuyingPrice).replace('.', ','));
        //     this.cdRef.markForCheck();
        // });

        // this.cdRef.markForCheck();
    }
}
