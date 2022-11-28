import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    SecurityContext,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator, MatSelectChange, MatSort } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { select, Store } from '@ngrx/store';
import { NumericValueType, RxwebValidators } from '@rxweb/reactive-form-validators';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { ErrorMessageService, HelperService, NoticeService } from 'app/shared/helpers';
import { IBreadcrumbs, LifecyclePlatform, ErrorHandler } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { StockManagementReason } from 'app/shared/models/stock-management-reason.model';
import {
    StockManagementReasonActions,
    UiActions,
    WarehouseActions,
} from 'app/shared/store/actions';
import {
    StockManagementReasonSelectors,
    WarehouseSelectors,
} from 'app/shared/store/selectors/sources';
import { environment } from 'environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { merge, Observable, Subject, of, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil, tap, withLatestFrom, switchMap, take, catchError } from 'rxjs/operators';

import { Warehouse } from '../../warehouses/models';
import { PayloadStockManagementCatalogue, StockManagementCatalogue } from '../models';
import { StockManagementCatalogueActions } from '../store/actions';
import * as fromStockManagements from '../store/reducers';
import { StockManagementCatalogueSelectors } from '../store/selectors';
import { UserSupplier } from 'app/shared/models/supplier.model';
import { AuthSelectors } from 'app/main/pages/core/auth/store/selectors';
import { QtySettingsApiService } from 'app/main/pages/logistics/stock-managements/services';

@Component({
    selector: 'app-stock-management-form',
    templateUrl: './stock-management-form.component.html',
    styleUrls: ['./stock-management-form.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockManagementFormComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    form: FormGroup;
    pageType: string;

    // CardHeader config
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'List SKU and Stock',
        },
        search: {
            active: true,
            changed: (value: string) => {
                this.search.setValue(value);
            },
        },
        // add: {
        //     permissions: []
        // },
        export: {
            permissions: ['OMS.EXPORT'],
        },
        import: {
            permissions: ['OMS.IMPORT'],
            useAdvanced: true,
            pageType: '',
        },
    };
    displayedColumns = [
        'no',
        'sku-id',
        'sku-name',
        'stock-type',
        'qty-change',
        'reason',
        'sellable', // stock
        'after', // column sellable calc with column qty-change
        // 'on-hand',
        // 'final'
    ];

    dataSource = [
        {
            id: '1',
            code: '82716127',
            name: 'LAKME CLASSIC EYEBROW PENCIL Brown',
            total: 58,
        },
        {
            id: '2',
            code: '82716127',
            name: 'LAKME CLASSIC EYEBROW PENCIL Red',
            total: 51,
        },
        {
            id: '3',
            code: '82716127',
            name: 'LAKME CLASSIC EYEBROW PENCIL White',
            total: 34,
        },
        {
            id: '4',
            code: '82716127',
            name: 'LAKME CLASSIC EYEBROW PENCIL Black',
            total: 100,
        },
    ];

    search: FormControl = new FormControl('');
    stockTypes: { id: boolean; label: string }[] = this._$helper.stockType();
    selectedWhName = '';

    dataSource$: Observable<Array<StockManagementCatalogue>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;
    warehouses$: Observable<Array<Warehouse>>;
    stockManagementReasons$: Observable<(method: string) => Array<StockManagementReason>>;
    plusReasons$: Observable<Array<StockManagementReason>>;

    quantityType: BehaviorSubject<string> = new BehaviorSubject<string>('-');

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private readonly _breadCrumbs: Array<IBreadcrumbs> = [
        {
            title: 'Home',
        },
        {
            title: 'Warehouse',
        },
        {
            title: 'Stock Management',
        }
    ];

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        private domSanitizer: DomSanitizer,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<fromStockManagements.FeatureState>,
        private ngxPermissions: NgxPermissionsService,
        private _$errorMessage: ErrorMessageService,
        private _$helper: HelperService,
        private _$notice: NoticeService,
        private qtySettingsApiService: QtySettingsApiService,
    ) {
        // Set footer action
        this.store.dispatch(
            UiActions.setFooterActionConfig({
                payload: {
                    progress: {
                        title: {
                            label: 'Skor tambah toko',
                            active: false,
                        },
                        value: {
                            active: false,
                        },
                        active: false,
                    },
                    action: {
                        save: {
                            label: 'Save',
                            active: false,
                        },
                        draft: {
                            label: 'Save Draft',
                            active: false,
                        },
                        cancel: {
                            label: 'Cancel',
                            active: false,
                        },
                        goBack: {
                            label: 'Back',
                            active: true,
                            url: '/pages/logistics/stock-managements',
                        },
                    },
                },
            })
        );

        this.store.dispatch(UiActions.showFooterAction());
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this._initPage();
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        this._initPage(LifecyclePlatform.AfterViewInit);
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    get skus(): FormArray {
        return this.form.get('skus') as FormArray;
    }

    afterCalc(sellable: number, idx: number): number {
        if (
            typeof sellable !== 'number' ||
            typeof idx !== 'number' ||
            !this.form.get(['skus', idx, 'qtyChange'])
        ) {
            return -1;
        }

        const qtyChange = this.form.get(['skus', idx, 'qtyChange']).value;

        if (typeof qtyChange === 'string' && isNaN(+qtyChange)) {
            return -1;
        }

        return sellable + +qtyChange;
    }

    generateNumber(idx: number): number {
        return this.paginator.pageIndex * this.paginator.pageSize + (idx + 1);
    }

    getErrorMessage(fieldName: string, parentName?: string, index?: number): string {
        if (!fieldName) {
            return;
        }

        if (parentName && typeof index === 'number') {
            const formParent = this.form.get(parentName) as FormArray;
            const { errors } = formParent.at(index).get(fieldName);

            if (errors) {
                const type = Object.keys(errors)[0];

                if (type) {
                    return errors[type].message;
                }
            }
        } else {
            const { errors } = this.form.get(fieldName);

            if (errors) {
                const type = Object.keys(errors)[0];

                if (type) {
                    return errors[type].message;
                }
            }
        }
    }

    hasError(field: string, isMatError = false): boolean {
        if (!field) {
            return;
        }

        const errors = this.form.get(field).errors;
        const touched = this.form.get(field).touched;
        const dirty = this.form.get(field).dirty;

        if (isMatError) {
            return errors && (dirty || touched);
        }

        return errors && ((touched && dirty) || touched);
    }

    hasLength(field: string, minLength: number): boolean {
        if (!field || !minLength) {
            return;
        }

        const value = this.form.get(field).value;

        return !value ? false : value.length <= minLength;
    }

    onReasonChange(ev: MatSelectChange, idx: number): void {
        setTimeout(() => {
            // console.log(
            //     `Reason ${idx}`,
            //     this.form.get(['skus', idx]),
            //     `is Valid ${this.form.get(['skus', idx]).valid}`,
            //     `is Invalid ${this.form.get(['skus', idx]).invalid}`
            // );

            const isValid = this.form.get(['skus', idx]).valid;

            if (isValid) {
                this._onSubmit(idx);
            }
        }, 100);
    }

    onStockTypeChange(ev: MatSelectChange, idx: number): void {
        if (typeof ev.value !== 'boolean') {
            this.form.get(['skus', idx, 'qtyChange']).reset();
            return;
        }

        if (ev.value) {
            this.form.get(['skus', idx, 'qtyChange']).setValue(0);
            this.form.get(['skus', idx, 'qtyChange']).disable();

            setTimeout(() => {
                this._onSubmit(idx);
            }, 100);
        } else {
            this.form.get(['skus', idx, 'qtyChange']).reset();
            this.form.get(['skus', idx, 'qtyChange']).enable();
        }
    }

    onQtyChange(value: number, idx: number): void {
        if (this.form.get(['skus', idx, 'qtyChange']).invalid) {
            const message = `${this.getErrorMessage(
                'qtyChange',
                'skus',
                idx
            )} at row ${this.generateNumber(idx)}`;

            this._$notice.open(message, 'error', {
                verticalPosition: 'bottom',
                horizontalPosition: 'right',
            });
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private createSkusForm(source: StockManagementCatalogue): void {
        const row = this.formBuilder.group({
            warehouseCatalogueId: source.id,
            unlimitedStock: [{ value: '', disabled: false }],
            qtyChange: [
                { value: '', disabled: false },
                [
                    RxwebValidators.minNumber({
                        value: -source.stock,
                        conditionalExpression: (x, y) => x.qtyChange !== 0,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    }),
                    RxwebValidators.minNumber({
                        value: 1,
                        conditionalExpression: (x, y) => x.qtyChange === 0,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    }),
                    RxwebValidators.numeric({
                        acceptValue: NumericValueType.Both,
                        allowDecimal: false,
                        message: this._$errorMessage.getErrorMessageNonState('default', 'pattern'),
                    }),
                ],
            ],
            warehouseCatalogueReasonId: [{ value: '', disabled: false }],
        });

        this.skus.push(row);
    }

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:
                this.sort.sortChange
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => (this.paginator.pageIndex = 0));

                merge(this.sort.sortChange, this.paginator.page)
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => {
                        // this.table.nativeElement.scrollIntoView(true);
                        this.table.nativeElement.scrollTop = 0;
                        this._initTable(this.form.get('whName').value);
                    });
                break;

            case LifecyclePlatform.OnDestroy:
                // Hide footer action
                this.store.dispatch(UiActions.hideFooterAction());

                // Reset core state stock management reasons
                this.store.dispatch(StockManagementReasonActions.clearStockManagementReasonState());

                // Reset core state stock management catalogues
                this.store.dispatch(StockManagementCatalogueActions.clearState());

                this._unSubs$.next();
                this._unSubs$.complete();

                this.quantityType.next('');
                this.quantityType.complete();
                break;

            default:
                this.paginator.pageSize = this.defaultPageSize;

                this.sort.sort({
                    id: 'updated_at',
                    start: 'desc',
                    disableClear: true,
                });

                // Fetch request warehouse
                this.store.dispatch(
                    WarehouseActions.fetchWarehouseRequest({ payload: { paginate: false } })
                );

                // Fetch request stock management reason
                this.store.dispatch(
                    StockManagementReasonActions.fetchStockManagementReasonRequest({
                        payload: { params: { paginate: false }, method: null },
                    })
                );

                this._fetchSupplierQtySettings();

                const { id } = this.route.snapshot.params;

                if (id === 'new') {
                    const hasAccess = this.ngxPermissions.hasPermission('WH.SM.CREATE');
                    hasAccess.then(hasAccess => {
                        if (!hasAccess) {
                            this.router.navigate(['/pages/errors/403'], {skipLocationChange: true});
                        }
                    });

                    this.pageType = 'new';
                    
                    this._breadCrumbs[3] = {
                        title: 'Add Stock',
                    },

                    // Set breadcrumbs
                    this.store.dispatch(
                        UiActions.createBreadcrumb({
                            payload: this._breadCrumbs,
                        })
                    );
                } else if (Math.sign(id) === 1) {
                    const hasAccess = this.ngxPermissions.hasPermission('WH.SM.UPDATE');
                    hasAccess.then(hasAccess => {
                        if (!hasAccess) {
                            this.router.navigate(['/pages/errors/403'], {skipLocationChange: true});
                        }
                    });
                    
                    this.pageType = 'edit';

                    this._breadCrumbs[3] = {
                        title: 'Update Stock',
                    },

                    // Set breadcrumbs
                    this.store.dispatch(
                        UiActions.createBreadcrumb({
                            payload: this._breadCrumbs,
                        })
                    );
                } else {
                    this.router.navigateByUrl('/pages/logistics/stock-managements');
                }

                this._initForm();

                if (this.pageType === 'new') {
                    this.form
                        .get('whName')
                        .valueChanges.pipe(
                            debounceTime(1000),
                            filter((v) => !!v),
                            takeUntil(this._unSubs$)
                        )
                        .subscribe((v) => {
                            this._initTable(v);
                        });
                } else if (this.pageType === 'edit') {
                    this._initTable(id);

                    this.store
                        .select(WarehouseSelectors.selectAll)
                        .pipe(takeUntil(this._unSubs$))
                        .subscribe((data) => {
                            if (data && data.length > 0) {
                                const selectedData = data.find((v) => v.id === id);
                                this.selectedWhName = selectedData.name;
                                this.form.get('whName').setValue(id);
                            }
                        });
                }

                this.dataSource$ = this.store
                    .select(StockManagementCatalogueSelectors.selectAll)
                    .pipe(
                        tap((data) => {
                            this.skus.clear();

                            if (data && data.length > 0) {
                                data.forEach((v) => this.createSkusForm(v));
                            }
                        })
                    );
                this.totalDataSource$ = this.store.select(
                    StockManagementCatalogueSelectors.getTotalItem
                );
                this.isLoading$ = this.store.select(StockManagementCatalogueSelectors.getIsLoading);

                this.warehouses$ = this.store.select(WarehouseSelectors.selectAll);
                this.stockManagementReasons$ = this.store.pipe(
                    select(StockManagementReasonSelectors.getReasons)
                );

                this.search.valueChanges
                    .pipe(
                        distinctUntilChanged(),
                        debounceTime(1000),
                        filter((v) => {
                            if (v) {
                                return (
                                    !!this.domSanitizer.sanitize(SecurityContext.HTML, v) &&
                                    this.form.get('whName').valid
                                );
                            }

                            return true && this.form.get('whName').valid;
                        }),
                        takeUntil(this._unSubs$)
                    )
                    .subscribe((v) => {
                        this.table.nativeElement.scrollTop = 0;
                        this._onRefreshTable(this.form.get('whName').value);
                    });

                // Trigger refresh
                this.store
                    .select(StockManagementCatalogueSelectors.getIsRefresh)
                    .pipe(
                        filter((v) => !!v),
                        takeUntil(this._unSubs$)
                    )
                    .subscribe(() => this._onRefreshTable(this.form.get('whName').value));
                break;
        }
    }

    private _initForm(): void {
        this.form = this.formBuilder.group({
            whName: [
                '',
                [
                    RxwebValidators.required({
                        message: this._$errorMessage.getErrorMessageNonState('default', 'required'),
                    }),
                ],
            ],
            skus: this.formBuilder.array([]),
        });
    }

    private _initTable(warehouseId: string): void {
        if (this.paginator) {
            const data: IQueryParams = {
                limit: this.paginator.pageSize || 5,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
            };

            data['paginate'] = true;

            if (this.sort.direction) {
                data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
                data['sortBy'] = this.sort.active;
            }

            const query = this.domSanitizer.sanitize(SecurityContext.HTML, this.search.value);

            if (query) {
                data['search'] = [
                    {
                        fieldName: 'keyword',
                        keyword: query,
                    },
                ];
            }

            this.store.dispatch(
                StockManagementCatalogueActions.fetchStockManagementCataloguesRequest({
                    payload: { params: data, warehouseId },
                })
            );
        }
    }

    private _onRefreshTable(warehouseId: string): void {
        this.paginator.pageIndex = 0;
        this.skus.clear();
        this._initTable(warehouseId);
    }

    private _onSubmit(idx: number): void {
        const isValid = this.form.get(['skus', idx]).valid;
        const body = this.form.getRawValue();

        if (!isValid || !body.skus[idx].warehouseCatalogueId) {
            return;
        }

        const payload = new PayloadStockManagementCatalogue({
            warehouseCatalogueId: body.skus[idx].warehouseCatalogueId,
            unlimitedStock: body.skus[idx].unlimitedStock,
            qtyChange: body.skus[idx].unlimitedStock === true ? 0 : +body.skus[idx].qtyChange,
            warehouseCatalogueReasonId:
                body.skus[idx].unlimitedStock === true
                    ? null
                    : body.skus[idx].warehouseCatalogueReasonId,
        });

        this.form.get(['skus', idx]).reset();

        this.store.dispatch(
            StockManagementCatalogueActions.updateStockManagementCatalogueRequest({ payload })
        );
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

    private _fetchSupplierQtySettings(): void {
        of(null).pipe(
            withLatestFrom<any, UserSupplier>(
                this.store.select<UserSupplier>(AuthSelectors.getUserSupplier)
            ),
            tap(x => this.debug('GET USER SUPPLIER FROM STATE', x)),
            switchMap<[null, UserSupplier], any>(([_, userSupplier]) => {
                // Jika user tidak ada data supplier.
                if (!userSupplier) {
                    throw new Error('ERR_USER_SUPPLIER_NOT_FOUND');
                }

                // Mengambil ID supplier-nya.
                const { supplierId } = userSupplier;
                
                // Melakukan request supplier quantity setting
                return this.qtySettingsApiService
                    .get<any>(supplierId)
                    .pipe(
                        tap(response => this.debug('FETCH SUPPLIER QUANTITY SETTINGS', { params: supplierId, response }))
                    );
            }),
            take(1),
            catchError(err => { throw err; }),
        ).subscribe({
            next: (response: { unlimitedStock: boolean }) => {
                if (response.unlimitedStock) {
                    this.quantityType.next('Unlimited : The stock in Agent app will be unlimited.');
                } else {
                    this.quantityType.next('None, The stock in Agent app will be using Stock Information.');
                }
            },
            error: (err) => {
                this.debug('ERROR FETCH SUPPLIER QUANTITY SETTINGS', { error: err }),
                this._$helper.showErrorNotification(new ErrorHandler(err));
            },
            complete: () => {
                // this.toggleLoading(false);
                this.debug('FETCH SUPPLIER QUANTITY SETTINGS COMPLETED');
            }
        });
    }
}
