import {
    AfterViewInit,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { CardHeaderComponent } from 'app/shared/components/card-header/card-header.component';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { ExportSelector } from 'app/shared/components/exports/store/selectors';
import { SinbadFilterConfig } from 'app/shared/components/sinbad-filter/models/sinbad-filter.model';
import { SinbadFilterService } from 'app/shared/components/sinbad-filter/services/sinbad-filter.service';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { IBreadcrumbs, PaginateResponse } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { environment } from 'environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { merge, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay, takeUntil } from 'rxjs/operators';
import { CataloguesEditPriceStockComponent } from './catalogues-edit-price-stock/catalogues-edit-price-stock.component';
import { CataloguesImportComponent } from './catalogues-import/catalogues-import.component';
import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { Catalogue, CatalogueFilterDto, SubBrandProps } from './models';
import { CatalogueFacadeService, CataloguesService, SubBrandApiService } from './services';
import { statusCatalogue } from './status';
import { CatalogueActions } from './store/actions';
import { fromCatalogue } from './store/reducers';
import { CatalogueSelectors } from './store/selectors';

type TFindCatalogueMode = 'all' | 'live' | 'bonus' | 'regular' | 'inactive' | 'exclusive';

@Component({
    selector: 'app-catalogues',
    templateUrl: './catalogues.component.html',
    styleUrls: ['./catalogues.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class CataloguesComponent implements OnInit, AfterViewInit, OnDestroy {
    private form: FormGroup;
    private unSubs$: Subject<any> = new Subject<any>();

    private breadCrumbs: IBreadcrumbs[] = [
        {
            title: 'Home',
        },
        {
            title: 'Catalogue',
            translate: 'BREADCRUMBS.CATALOGUE',
        },
        {
            title: 'Manage Product',
            translate: 'BREADCRUMBS.MANAGE_PRODUCT',
            active: true,
        },
    ];
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;
    pageSize: number;

    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Catalogue',
        },
        search: {
            active: true,
        },
        add: {
            permissions: ['CATALOGUE.CREATE'],
        },
        export: {
            permissions: ['CATALOGUE.EXPORT'],
            useAdvanced: true,
            pageType: 'catalogues',
        },
        import: {
            permissions: ['CATALOGUE.IMPORT'],
            useAdvanced: true,
            pageType: 'catalogues',
        },
        filter: {
            permissions: [],
        },
    };

    filterConfig: SinbadFilterConfig = {
        by: {
            status: {
                title: 'Status',
                sources: [
                    { id: 'active', label: 'Active', checked: false },
                    { id: 'inactive', label: 'Inactive', checked: false },
                ],
            },
            type: {
                title: 'Type',
                sources: [{ id: 'bonus', label: 'Bonus' }],
            },
            brand: {
                title: 'Brand',
                sources: [],
            },
            subBrand: {
                title: 'Sub Brand',
                sources: [],
            },
            faktur: {
                title: 'Faktur',
                sources: [],
            },
            basePrice: {
                title: 'Base Price',
                sources: [],
            },
        },
        showFilter: true,
    };

    keyword: string = null;
    globalFilterDto: CatalogueFilterDto;

    dataSource: MatTableDataSource<Catalogue>;
    initialDisplayedColumns = [
        // 'checkbox',
        'name',
        'sku',
        'externalId',
        // 'variant',
        'price',
        // 'stock',
        // 'sales',
        'type',
        'exclusive',
        'status',
        'actions',
    ];
    displayedColumns = this.initialDisplayedColumns;
    hasSelected: boolean;
    search: string;
    statusCatalogue: any;
    findCatalogueMode: TFindCatalogueMode = 'all';

    dataSource$: Observable<Array<Catalogue>>;
    isLoading$: Observable<boolean>;
    isRequestingExport$: Observable<boolean>;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef<HTMLElement>;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('filter', { static: true })
    filter: ElementRef;

    @ViewChild('cardHeader', { static: true })
    cardHeader: CardHeaderComponent;

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private store: Store<fromCatalogue.FeatureState>,
        private fuseSidebarService: FuseSidebarService,
        private sinbadFilterService: SinbadFilterService,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private catalogueFacade: CatalogueFacadeService,
        private cataloguesService: CataloguesService,
        private readonly subBrandApiService: SubBrandApiService,
        private matDialog: MatDialog,
        public translate: TranslateService,
        private _helper: HelperService,
        private _notice: NoticeService,
        private ngxPermissions: NgxPermissionsService
    ) {
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

        this.statusCatalogue = statusCatalogue;

        this.store.dispatch(CatalogueActions.fetchTotalCatalogueStatusRequest());
    }

    private updatePrivileges(): void {
        /* this.ngxPermissionsService
            .hasPermission(['CATALOGUE.UPDATE', 'CATALOGUE.DELETE'])
            .then((result) => {
                // Jika ada permission-nya.
                if (result) {
                    if (this.findCatalogueMode === 'blocked') {
                        this.displayedColumns = [
                            'name',
                            'lastUpdate',
                            'timeLimit',
                            'blockType',
                            'blockReason',
                            'blockSuggest',
                            'actions',
                        ];
                    } else {
                        this.displayedColumns = this.initialDisplayedColumns;
                    }
                }

                else {
                    if (this.findCatalogueMode === 'blocked') {
                        this.displayedColumns = [
                            'name',
                            'lastUpdate',
                            'timeLimit',
                            'blockType',
                            'blockReason',
                            'blockSuggest',
                            // 'actions'
                        ];
                    } else {
                        this.displayedColumns = [
                            // 'checkbox',
                            'name',
                            'sku',
                            'externalId',
                            // 'variant',
                            'price',
                            // 'stock',
                            // 'sales',
                            'actions',
                        ];
                    }
                }
            }); */
    }

    private applyCardHeaderEvent(): void {
        // Mengimplementasi event klik tombol "Add" dari card header menuju halaman Add Product.
        // this.cardHeaderConfig.add.onClick = () => {
        //     this.router.navigate(['/pages/catalogues/add']);
        // };

        // Mengimplementasi event "Search" dari card header menuju fungsi onSearch.
        this.cardHeaderConfig.search.changed = (value: string) => this.onSearch(value);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Form for the filter
        this.form = this.fb.group({
            basePrice: null,
            brand: null,
            subBrand: null,
            faktur: null,
            maxAmount: null,
            minAmount: null,
            search: null,
            status: null,
            type: null,
        });

        this.pageSize = this.defaultPageSize;

        const canDoActions = this.ngxPermissions.hasPermission([
            'CATALOGUE.UPDATE',
            'CATALOGUE.DELETE',
        ]);

        canDoActions.then((hasAccess) => {
            if (hasAccess) {
                this.displayedColumns = [
                    // 'checkbox',
                    'name',
                    'sku',
                    'externalId',
                    // 'variant',
                    'price',
                    // 'stock',
                    // 'sales',
                    'type',
                    'exclusive',
                    'status',
                    'actions',
                ];
            } else {
                this.displayedColumns = [
                    // 'checkbox',
                    'name',
                    'sku',
                    'externalId',
                    // 'variant',
                    'price',
                    // 'stock',
                    // 'sales',
                    'type',
                    'exclusive',
                    'status',
                ];
            }
        });

        this.form
            .get('brand')
            .valueChanges.pipe(takeUntil(this.unSubs$))
            .subscribe((value) => {
                HelperService.debug('[CataloguesComponent] ngOnInit brand.valueChanges', {
                    value,
                });

                if (!Array.isArray(value) && this.filterConfig.by.subBrand) {
                    this._handleSubBrandByBrand(value.id);
                }
            });

        this.sinbadFilterService.setConfig({ ...this.filterConfig, form: this.form });

        // Handle action in filter
        this.sinbadFilterService
            .getClickAction$()
            .pipe(
                filter((action) => action === 'reset' || action === 'submit'),
                takeUntil(this.unSubs$)
            )
            .subscribe((action) => {
                if (action === 'reset') {
                    this.cardHeader.reset();
                    this.form.reset();
                    this.globalFilterDto = null;
                } else {
                    this._handleApplyFilter();
                }

                HelperService.debug('[CatalogueComponent] ngOnInit getClickAction$()', {
                    form: this.form,
                    filterConfig: this.filterConfig,
                });
            });
        // Form for the filter end

        this.catalogueFacade.createBreadcrumb(this.breadCrumbs);

        // Mengimplementasi event-event dari konfigurasi card header.
        this.applyCardHeaderEvent();

        this.updatePrivileges();

        this.search = '';
        this.hasSelected = false;

        this.dataSource$ = this.store
            .select(CatalogueSelectors.getAllCatalogues)
            .pipe(shareReplay());

        this.isLoading$ = this.store.select(CatalogueSelectors.getIsLoading).pipe(shareReplay());

        this.isRequestingExport$ = this.store.select(ExportSelector.getRequestingState);

        this.store
            .select(CatalogueSelectors.getRefreshStatus)
            .pipe(takeUntil(this._unSubs$))
            .subscribe((needRefresh) => {
                if (needRefresh) {
                    this.onRefreshTable();
                }

                this.store.dispatch(CatalogueActions.setRefreshStatus({ status: false }));
            });

        // this.paginator.pageSize = this.defaultPageSize;

        this.route.queryParams
            .pipe(
                filter((params) => {
                    const { limit, page_index: pageIndex } = params;

                    if (typeof limit !== 'undefined' && typeof pageIndex !== 'undefined') {
                        return true;
                    } else {
                        this.onRefreshTable();
                        return false;
                    }
                }),
                takeUntil(this._unSubs$)
            )
            .subscribe({
                next: ({ limit, page_index: pageIndex }) => {
                    if (typeof limit !== 'undefined' && typeof pageIndex !== 'undefined') {
                        this.paginator.pageSize = +limit;
                        this.paginator.pageIndex = +pageIndex;
                        this.initTable();
                    } else {
                        this.paginator.pageSize = this.pageSize;
                    }
                },
            });
    }

    ngAfterViewInit(): void {
        // Need for demo
        // this.dataSource.paginator = this.paginator;
        // this.dataSource.sort = this.sort;
        // Set default first status active
        this.store.dispatch(
            UiActions.setCustomToolbarActive({
                payload: 'all-type',
            })
        );

        this._fuseNavigationService.register('customNavigation', this.statusCatalogue);

        this.store.dispatch(UiActions.showCustomToolbar());

        this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(takeUntil(this._unSubs$))
            .subscribe(() => {
                this.table.nativeElement.scrollTop = 0;
                this.initTable();
            });

        this.store
            .select(CatalogueSelectors.getAllTotalCatalogue)
            .pipe(takeUntil(this._unSubs$))
            .subscribe((payload) => {
                const {
                    totalAllStatus,
                    totalActive,
                    totalBonus,
                    totalRegular,
                    totalInactive,
                    totalExclusive,
                } = payload;

                this.store.dispatch(
                    UiActions.updateItemNavigation({
                        payload: {
                            id: 'all-type',
                            properties: { title: `All (${totalAllStatus})` },
                            key: 'customNavigation',
                        },
                    })
                );

                this.store.dispatch(
                    UiActions.updateItemNavigation({
                        payload: {
                            id: 'live',
                            properties: { title: `Active (${totalActive})` },
                            key: 'customNavigation',
                        },
                    })
                );

                this.store.dispatch(
                    UiActions.updateItemNavigation({
                        payload: {
                            id: 'bonus',
                            properties: { title: `Bonus (${totalBonus})` },
                            key: 'customNavigation',
                        },
                    })
                );

                this.store.dispatch(
                    UiActions.updateItemNavigation({
                        payload: {
                            id: 'regular',
                            properties: { title: `Regular (${totalRegular})` },
                            key: 'customNavigation',
                        },
                    })
                );

                this.store.dispatch(
                    UiActions.updateItemNavigation({
                        payload: {
                            id: 'inactive',
                            properties: { title: `Inactive (${totalInactive})` },
                            key: 'customNavigation',
                        },
                    })
                );

                this.store.dispatch(
                    UiActions.updateItemNavigation({
                        payload: {
                            id: 'exclusive',
                            properties: { title: `Exclusive (${totalExclusive})` },
                            key: 'customNavigation',
                        },
                    })
                );
            });

        this.store
            .select(UiSelectors.getCustomToolbarActive)
            .pipe(distinctUntilChanged(), takeUntil(this._unSubs$))
            .subscribe((index) => {
                // if (index === 'all-type') {
                //     this.findCatalogueMode = 'all';
                // } else if (index === 'live') {
                //     this.findCatalogueMode = 'live';
                // } else if (index === 'bonus') {
                //     this.findCatalogueMode = 'bonus';
                // } else if (index === 'regular') {
                //     this.findCatalogueMode = 'regular';
                // } else if (index === 'inactive') {
                //     this.findCatalogueMode = 'inactive';
                // } else if (index === 'exclusive') {
                //     this.findCatalogueMode = 'exclusive';
                // }

                switch (index) {
                    case 'all-type':
                        this.findCatalogueMode = 'all';
                        break;

                    default:
                        this.findCatalogueMode = index as TFindCatalogueMode;
                        break;
                }

                this.updatePrivileges();
                this.initTable();
            });
    }

    onClickFilter(): void {
        this.fuseSidebarService.getSidebar('sinbadFilter').toggleOpen();
    }

    onClickAddCatalogue(): void {
        this.router.navigateByUrl('/pages/catalogues/add');
    }

    onSearch(ev: string): void {
        /* const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, ev);

        if (!!sanitized) {
            this.search = sanitized;
            this.onRefreshTable();
        } else if (ev.length === 0) {
            this.search = sanitized;
            this.onRefreshTable();
        } */

        this.search = ev;
        this.keyword = ev;

        this.onRefreshTable();

        if (this.form && this.form.get('search')) {
            this.form.get('search').setValue(ev);
        }
    }

    ngOnDestroy(): void {
        this._fuseNavigationService.unregister('customNavigation');
        this.store.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.store.dispatch(UiActions.hideCustomToolbar());

        this._unSubs$.next();
        this._unSubs$.complete();
        this.unSubs$.next();
        this.unSubs$.complete();
        this.sinbadFilterService.resetConfig();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    get totalDataSource$(): Observable<number> {
        return this.store.pipe(
            select(CatalogueSelectors.getTotalCatalogue),
            distinctUntilChanged(),
            takeUntil(this._unSubs$)
        );
    }

    addProduct(): void {
        this.router.navigate(['/pages/catalogues/add']);
    }

    viewProduct(id: string): void {
        this.store.dispatch(
            CatalogueActions.setSelectedCatalogue({
                payload: id,
            })
        );
        this.router.navigate(['/pages/catalogues/view', id]);
    }

    onChangePage(ev: PageEvent): void {
        HelperService.debug('[CataloguesComponent] onChangePage', { ev });

        this.router.navigate(['.'], {
            relativeTo: this.route,
            queryParams: { limit: ev.pageSize, page_index: ev.pageIndex },
        });

        /* const data: IQueryParams = {
            limit: this.paginator.pageSize,
            skip: this.paginator.pageSize * this.paginator.pageIndex,
        };

        data['paginate'] = true;

        if (this.sort.direction) {
            data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
            data['sortBy'] = this.sort.active;
        }

        this.store.dispatch(CatalogueActions.resetCatalogues());

        this.store.dispatch(
            CatalogueActions.fetchCataloguesRequest({
                payload: data,
            })
        ); */
    }

    onDelete(item: Catalogue): void {
        if (!item) {
            return;
        }

        this.store.dispatch(CatalogueActions.confirmRemoveCatalogue({ payload: item }));
    }

    setActive(item: Catalogue): void {
        if (!item) {
            return;
        }

        this.store.dispatch(CatalogueActions.confirmSetCatalogueToActive({ payload: item }));
    }

    onBlock(item: Catalogue): void {
        if (!item) {
            return;
        }

        this.store.dispatch(CatalogueActions.confirmSetCatalogueToInactive({ payload: item }));
    }

    setInactive(item: Catalogue): void {
        if (!item) {
            return;
        }

        this.store.dispatch(CatalogueActions.confirmSetCatalogueToInactive({ payload: item }));
    }

    onImportProduct(): void {
        this.matDialog.open(CataloguesImportComponent, {
            data: {
                title: 'Import',
            },
            disableClose: true,
            width: '1000px',
        });
    }

    editCatalogue(editMode: 'price' | 'stock', catalogue: Catalogue): void {
        this.store.dispatch(CatalogueActions.setSelectedCatalogue({ payload: catalogue.id }));

        setTimeout(
            () =>
                this.matDialog.open(CataloguesEditPriceStockComponent, {
                    data: {
                        // catalogueId: catalogue.id,
                        catalogue,
                        editMode,
                        // price: catalogue.suggestRetailPrice,
                        // stock: catalogue.stock
                    },
                    disableClose: false,
                }),
            100
        );
    }

    onDownload(template: string): void {
        this._helper.downloadTemplate().subscribe((links) => {
            for (const type of Object.keys(links)) {
                if (type === template) {
                    return window.open(links[type], '_blank');
                }
            }

            return this._notice.open('Template not found.', 'error', {
                horizontalPosition: 'right',
                verticalPosition: 'bottom',
            });
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private onRefreshTable(): void {
        // this.paginator.pageIndex = 0;
        this.table.nativeElement.scrollTop = 0;
        this.paginator.pageIndex = 0;
        this.paginator.pageSize = this.defaultPageSize;
        this.initTable();
    }

    private initTable(): void {
        if (this.paginator) {
            // const { pageIndex, limit } = this.route.snapshot.queryParams;

            // console.log('INIT LIST', {
            //     pageIndex,
            //     limit,
            //     route: this.route.snapshot,
            //     paginator: this.paginator,
            // });

            /* if (typeof limit !== 'undefined') {
                this.paginator.pageSize = +limit;
            } else {
                this.paginator.pageSize = this.defaultPageSize;
            }

            if (typeof pageIndex !== 'undefined') {
                this.paginator.pageIndex = +pageIndex;
            } */

            const data: IQueryParams = {
                limit: this.paginator.pageSize || this.pageSize,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
            };

            data['paginate'] = true;

            if (this.sort.direction) {
                data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';

                if (this.sort.active === 'price') {
                    data['sortBy'] = 'suggest_retail_price';
                } else if (this.sort.active === 'lastUpdate') {
                    data['sortBy'] = 'updated_at';
                } else if (this.sort.active === 'externalId') {
                    data['sortBy'] = 'external_id';
                } else {
                    data['sortBy'] = this.sort.active;
                }
            } else {
                data['sort'] = 'desc';
                data['sortBy'] = 'id';
            }

            switch (this.findCatalogueMode) {
                case 'live':
                    data['status'] = 'active';
                    break;
                case 'bonus':
                    data['status'] = 'active';
                    data['search'] = [
                        ...(data['search'] && data['search'].length ? data['search'] : []),
                        { fieldName: 'type', keyword: 'bonus' },
                    ];
                    break;
                case 'regular':
                    data['status'] = 'active';
                    data['search'] = [
                        ...(data['search'] && data['search'].length ? data['search'] : []),
                        { fieldName: 'type', keyword: 'regular' },
                    ];
                    break;
                /* case 'empty':
                    data['emptyStock'] = true;
                    break;
                case 'blocked':
                    data['status'] = 'banned';
                    break; */
                case 'inactive':
                    data['status'] = 'inactive';
                    break;

                case 'exclusive':
                    data['search'] = [
                        ...(data['search'] && data['search'].length ? data['search'] : []),
                        { fieldName: 'onlyExclusive', keyword: 'true' },
                    ];
                    break;
            }

            if (this.search) {
                data['search'] = [
                    ...(data['search'] && data['search'].length ? data['search'] : []),
                    {
                        fieldName: 'name',
                        keyword: this.search,
                    },
                    {
                        fieldName: 'sku',
                        keyword: this.search,
                    },
                    {
                        fieldName: 'external_id',
                        keyword: this.search,
                    },
                ];
            }

            data['search'] = this.cataloguesService.handleSearchGlobalFilter(
                data['search'],
                this.globalFilterDto
            );

            this.store.dispatch(CatalogueActions.resetCatalogues());

            this.store.dispatch(
                CatalogueActions.fetchCataloguesRequest({
                    payload: data,
                })
            );
        }
    }

    private _handleApplyFilter(): void {
        this.globalFilterDto = {};

        const {
            brand,
            subBrand: subBrandId,
            faktur,
            maxAmount,
            minAmount,
            status,
            type: formType,
        } = this.form.value;

        const configStatus = this.filterConfig.by['status'];
        const totalStatusSource =
            configStatus && configStatus.sources && configStatus.sources.length;
        const newStatus = this.cataloguesService.prepareStatusValue(status, totalStatusSource);
        const brandId = this.cataloguesService.prepareBrandValue(brand);
        const invoiceGroupId = this.cataloguesService.prepareFakturValue(faktur);
        const priceLte = maxAmount;
        const priceGte = minAmount;
        const type = formType === true ? 'bonus' : 'regular';

        this.globalFilterDto = {
            status: newStatus,
        };

        // Handle filter brand
        if (brandId && !subBrandId) {
            this.globalFilterDto = {
                ...this.globalFilterDto,
                brandId,
            };
        }

        // Handle filter sub brand
        if (subBrandId) {
            this.globalFilterDto = {
                ...this.globalFilterDto,
                subBrandId,
            };
        }

        // Handle filter faktur
        if (invoiceGroupId) {
            this.globalFilterDto = {
                ...this.globalFilterDto,
                invoiceGroupId,
            };
        }

        // Handle filter minimum base price
        if (priceGte) {
            this.globalFilterDto = {
                ...this.globalFilterDto,
                priceGte,
            };
        }

        // Handle filter maximum base price
        if (priceLte) {
            this.globalFilterDto = {
                ...this.globalFilterDto,
                priceLte,
            };
        }

        // Handle filter bonus
        if (type) {
            this.globalFilterDto = {
                ...this.globalFilterDto,
                type,
            };
        }

        this.onRefreshTable();
    }

    private _handleSubBrandByBrand(brandId: string): void {
        this.subBrandApiService
            .getWithQuery<PaginateResponse<SubBrandProps>>({
                search: [
                    {
                        fieldName: 'brandId',
                        keyword: brandId,
                    },
                ],
            })
            .pipe(
                map((resp) => (resp.total > 0 ? resp.data : [])),
                takeUntil(this.unSubs$)
            )
            .subscribe((sources) => {
                this.filterConfig = {
                    ...this.filterConfig,
                    by: {
                        ...this.filterConfig.by,
                        subBrand: {
                            ...this.filterConfig.by.subBrand,
                            sources,
                        },
                    },
                };

                this.sinbadFilterService.setConfig({ ...this.filterConfig, form: this.form });

                HelperService.debug('[CataloguesComponent] _handleSubBrandByBrand subscribe', {
                    filterConfig: this.filterConfig,
                });
            });
    }
}
