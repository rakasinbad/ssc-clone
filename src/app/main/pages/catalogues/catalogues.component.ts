import {
    AfterViewInit,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    SecurityContext,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { fromExport } from 'app/shared/components/exports/store/reducers';
import { ExportSelector } from 'app/shared/components/exports/store/selectors';
import { GeneratorService, HelperService, NoticeService } from 'app/shared/helpers';
import { IBreadcrumbs } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { environment } from 'environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { merge, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { CataloguesEditPriceStockComponent } from './catalogues-edit-price-stock/catalogues-edit-price-stock.component';
import { CataloguesImportComponent } from './catalogues-import/catalogues-import.component';
import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { Catalogue } from './models';
import { CatalogueFacadeService, CataloguesService } from './services';
import { statusCatalogue } from './status';
import { CatalogueActions } from './store/actions';
import { fromCatalogue } from './store/reducers';
import { CatalogueSelectors } from './store/selectors';

type TFindCatalogueMode = 'all' | 'live' | 'empty' | 'blocked' | 'inactive';

@Component({
    selector: 'app-catalogues',
    templateUrl: './catalogues.component.html',
    styleUrls: ['./catalogues.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class CataloguesComponent implements OnInit, AfterViewInit, OnDestroy {
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
    };

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
        'status',
        'actions',
    ];
    displayedColumns = this.initialDisplayedColumns;
    hasSelected: boolean;
    search: string;
    statusCatalogue: any;
    findCatalogueMode: TFindCatalogueMode = 'all';

    // defaultPageSize = 100;
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

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        private router: Router,
        private store: Store<fromCatalogue.FeatureState>,
        private exportStore: Store<fromExport.State>,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private catalogueFacade: CatalogueFacadeService,
        private _$catalogue: CataloguesService,
        private _$generate: GeneratorService,
        private matDialog: MatDialog,
        public translate: TranslateService,
        private readonly sanitizer: DomSanitizer,
        private _helper: HelperService,
        private _notice: NoticeService,
        private ngxPermissionsService: NgxPermissionsService
    ) {
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

        this.statusCatalogue = statusCatalogue;

        this.store.dispatch(CatalogueActions.fetchTotalCatalogueStatusRequest());
    }

    private updatePrivileges(): void {
        this.ngxPermissionsService
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
                } else {
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
            });
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
        this.catalogueFacade.createBreadcrumb(this.breadCrumbs);
        // Mengimplementasi event-event dari konfigurasi card header.
        this.applyCardHeaderEvent();

        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
        // this.store.dispatch(UiActions.showCustomToolbar());
        // this.translate.set('STATUS.CATALOGUE.ALL_PARAM.TITLE', 'Semua 222', 'id');
        // this.translate.set('STATUS.CATALOGUE.ALL_PARAM.TITLE', 'Semua 222', 'en');
        // console.log(this._fuseNavigationService.getNavigationItem('all-type', this._fuseNavigationService.getNavigation('customNavigation')));
        this.updatePrivileges();

        // this._unSubs$ = new Subject<void>();
        this.search = '';
        this.hasSelected = false;

        this.dataSource$ = this.store.select(CatalogueSelectors.getAllCatalogues);
        this.isLoading$ = this.store.select(CatalogueSelectors.getIsLoading);
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

        // this.search.valueChanges
        //     .pipe(
        //         distinctUntilChanged(),
        //         debounceTime(1000),
        //         filter(value => {
        //             const sanitized = !!this.sanitizer.sanitize(SecurityContext.HTML, value);

        //             if (sanitized) {
        //                 return true;
        //             } else {
        //                 if (value.length === 0) {
        //                     return true;
        //                 } else {
        //                     return false;
        //                 }
        //             }
        //         }),
        //         takeUntil(this._unSubs$)
        //     ).subscribe(() => {
        //         this.onRefreshTable();
        //     });

        // Need for demo
        // this.store
        //     .select(CatalogueSelectors.getAllCatalogues)
        //     .pipe(takeUntil(this._unSubs$))
        //     .subscribe(source => {
        //         this.dataSource = new MatTableDataSource(source);
        //     });

        // this.store.select([
        //     CatalogueSelectors.getAllCatalogues,
        //     CatalogueSelectors.getBlockedCatalogues,
        //     CatalogueSelectors.getEmptyStockCatalogues,
        //     CatalogueSelectors.getLiveCatalogues
        // ]).pipe(takeUntil(this._unSubs$));

        // this.dataSource$ = this.store.select(OrderSelectors.getAllOrder);
        this.paginator.pageSize = this.defaultPageSize;

        // this._$catalogue.getCatalogueStatuses({ allCount: 40, blockedCount: 5, emptyCount: 10, liveCount: 25 });
        this.store
            .select(CatalogueSelectors.getRefreshStatus)
            .pipe(takeUntil(this._unSubs$))
            .subscribe((status) => {
                if (status) {
                    this.onRefreshTable();
                }
            });
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

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
                    totalAllStatus: allCount,
                    totalActive: liveCount,
                    totalEmptyStock: emptyStock,
                    totalBanned: blockedCount,
                } = payload;

                this.store.dispatch(
                    UiActions.updateItemNavigation({
                        payload: {
                            id: 'all-type',
                            properties: { title: `All (${allCount})` },
                            key: 'customNavigation',
                        },
                    })
                );

                this.store.dispatch(
                    UiActions.updateItemNavigation({
                        payload: {
                            id: 'live',
                            properties: { title: `Active (${liveCount})` },
                            key: 'customNavigation',
                        },
                    })
                );

                this.store.dispatch(
                    UiActions.updateItemNavigation({
                        payload: {
                            id: 'empty',
                            properties: { title: `Empty (${emptyStock})` },
                            key: 'customNavigation',
                        },
                    })
                );

                this.store.dispatch(
                    UiActions.updateItemNavigation({
                        payload: {
                            id: 'banned',
                            properties: { title: `Banned (${blockedCount})` },
                            key: 'customNavigation',
                        },
                    })
                );

                this.store.dispatch(
                    UiActions.updateItemNavigation({
                        payload: {
                            id: 'inactive',
                            properties: { title: `Inactive` },
                            key: 'customNavigation',
                        },
                    })
                );
            });

        this.store
            .select(UiSelectors.getCustomToolbarActive)
            .pipe(distinctUntilChanged(), takeUntil(this._unSubs$))
            .subscribe((index) => {
                // console.log('INDEX', index);
                // if (index === 'blocked') {
                //     this.displayedColumns = [
                //         'name',
                //         'lastUpdate',
                //         'timeLimit',
                //         'blockType',
                //         'blockReason',
                //         'blockSuggest',
                //         'actions'
                //     ];
                // } else {
                //     this.displayedColumns = this.initialDisplayedColumns;
                // }

                if (index === 'all-type') {
                    this.findCatalogueMode = 'all';
                    // this.dataSource$ = this.store.select(CatalogueSelectors.getAllCatalogues);
                } else if (index === 'live') {
                    this.findCatalogueMode = 'live';
                    // this.dataSource$ = this.store.select(CatalogueSelectors.getLiveCatalogues);
                } else if (index === 'empty') {
                    // this.findEmptyStock = true;
                    this.findCatalogueMode = 'empty';
                    // this.initTable();
                    // this.dataSource$ = this.store.select(CatalogueSelectors.getEmptyStockCatalogues);
                } else if (index === 'blocked') {
                    this.findCatalogueMode = 'blocked';
                    // this.dataSource$ = this.store.select(CatalogueSelectors.getBlockedCatalogues);
                } else if (index === 'inactive') {
                    this.findCatalogueMode = 'inactive';
                    // this.dataSource$ = this.store.select(CatalogueSelectors.getInactiveCatalogues).pipe(
                    //     tap(catalogues => console.log(catalogues))
                    // );
                }

                this.updatePrivileges();
                this.initTable();
            });
        // this.initTable();
    }

    onClickAddCatalogue(): void {
        this.router.navigateByUrl('/pages/catalogues/add');
    }

    onSearch($event: string): void {
        // console.log($event);
        const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, $event);

        if (!!sanitized) {
            this.search = sanitized;
            this.onRefreshTable();
        } else if ($event.length === 0) {
            this.search = sanitized;
            this.onRefreshTable();
        }
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.
        this._fuseNavigationService.unregister('customNavigation');
        this.store.dispatch(UiActions.createBreadcrumb({ payload: null }));
        this.store.dispatch(UiActions.hideCustomToolbar());

        this._unSubs$.next();
        this._unSubs$.complete();
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

    // editProduct(id: string): void {
    //     this.store.dispatch(CatalogueActions.setSelectedCatalogue({
    //         payload: id
    //     }));
    //     this.router.navigate(['/pages/catalogues/edit', id]);
    // }

    viewProduct(id: string): void {
        this.store.dispatch(
            CatalogueActions.setSelectedCatalogue({
                payload: id,
            })
        );
        this.router.navigate(['/pages/catalogues/view', id]);
    }

    onChangePage(ev: PageEvent): void {
        console.log('Change page', ev);

        const data: IQueryParams = {
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
        );

        // this.table.nativeElement.scrollIntoView();
    }

    onDelete(item): void {
        if (!item) {
            return;
        }

        this.store.dispatch(CatalogueActions.confirmRemoveCatalogue({ payload: item }));
    }

    setActive(item): void {
        if (!item) {
            return;
        }

        this.store.dispatch(CatalogueActions.confirmSetCatalogueToActive({ payload: item }));
        // this.matDialog.open(CataloguesActiveInactiveComponent, {
        //     data: {
        //         mode: 'active',
        //         catalogue: item
        //     }
        // });
    }

    onBlock(item): void {
        if (!item) {
            return;
        }

        this.store.dispatch(CatalogueActions.confirmSetCatalogueToInactive({ payload: item }));
        // this.matDialog.open(CataloguesBlockComponent, {
        //     data: {
        //         catalogue: item
        //     }
        // });
    }

    setInactive(item): void {
        if (!item) {
            return;
        }

        this.store.dispatch(CatalogueActions.confirmSetCatalogueToInactive({ payload: item }));
        // this.matDialog.open(CataloguesActiveInactiveComponent, {
        //     data: {
        //         mode: 'inactive',
        //         catalogue: item
        //     }
        // });
    }

    onExportProduct(): void {
        // this.matDialog.open(ExportsComponent, {
        //     disableClose: true,
        //     width: '70vw'
        // });
        // this.exportStore.dispatch(ExportActions.startExportRequest({
        //     payload: {
        //         paginate: false,
        //         page: '',
        //         configuration: {}
        //     }
        // }));
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
        this.initTable();
    }

    private initTable(): void {
        if (this.paginator) {
            const data: IQueryParams = {
                limit: this.paginator.pageSize || this.defaultPageSize,
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
                case 'empty':
                    data['emptyStock'] = true;
                    break;
                case 'blocked':
                    data['status'] = 'banned';
                    break;
                case 'inactive':
                    data['status'] = 'inactive';
                    break;
            }

            // const searchValue = this.sanitizer.sanitize(SecurityContext.HTML, this.search);
            if (this.search) {
                data['search'] = [
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

            this.store.dispatch(CatalogueActions.resetCatalogues());

            this.store.dispatch(
                CatalogueActions.fetchCataloguesRequest({
                    payload: data,
                })
            );
        }
    }
}
