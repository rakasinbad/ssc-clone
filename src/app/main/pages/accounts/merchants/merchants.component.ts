import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    ChangeDetectorRef,
    TemplateRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { ExportSelector } from 'app/shared/components/exports/store/selectors';
import { IButtonImportConfig } from 'app/shared/components/import-advanced/models';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { ButtonDesignType } from 'app/shared/models/button.model';
import { LifecyclePlatform, TNullable } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { SupplierStore } from 'app/shared/models/supplier.model';
import { User } from 'app/shared/models/user.model';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { combineLatest, merge, Observable, Subject, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil, flatMap, tap, take, withLatestFrom } from 'rxjs/operators';

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { StoreActions } from './store/actions';
import { fromMerchant } from './store/reducers';
import { StoreSelectors } from './store/selectors';
import { SelectionModel, SelectionChange } from '@angular/cdk/collections';

import { ApplyDialogService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog.service';
import { ApplyDialogFactoryService } from 'app/shared/components/dialogs/apply-dialog/services/apply-dialog-factory.service';

@Component({
    selector: 'app-merchants',
    templateUrl: './merchants.component.html',
    styleUrls: ['./merchants.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MerchantsComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = 10;
    readonly defaultPageOpts = environment.pageSizeTable;

    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Store List'
        },
        batchAction: {
            actions: [
                // {
                //     id: 'approve',
                //     label: 'Approve',
                // },
                // {
                //     id: 'reject',
                //     label: 'Reject',
                // },
                {
                    id: 'resend',
                    label: 'Re-send',
                }
            ],
            onActionSelected: action => {
                if (action.id === 'resend') {
                    this.onResendStores();
                }
            },
            show: false
        },
        search: {
            active: true,
            changed: (value: string) => {
                this.search.setValue(value);
                setTimeout(() => this._onRefreshTable(), 100);
            }
        },
        add: {
            permissions: ['ACCOUNT.STORE.CREATE'],
            onClick: () => {
                this.router.navigate(['/pages/account/stores/new']);
            }
        },
        export: {
            permissions: ['ACCOUNT.STORE.EXPORT'],
            useAdvanced: true,
            pageType: 'stores'
        },
        import: {
            permissions: ['ACCOUNT.STORE.IMPORT'],
            useAdvanced: true,
            pageType: 'stores'
        }
    };

    selection: SelectionModel<SupplierStore>;
    search: FormControl = new FormControl('');
    formConfig = {
        status: {
            label: 'Store List Status',
            placeholder: 'Choose Store List Status',
            sources: this._$helper.storeStatus(),
            rules: {
                required: true
            }
        },
        search: {
            active: true,
            changed: (value: string) => {
                this.search.setValue(value);
                setTimeout(() => this._onRefreshTable(), 100);
            }
        },
        add: {
            permissions: ['ACCOUNT.STORE.CREATE'],
            onClick: () => {
                this.router.navigate(['/pages/account/stores/new']);
            }
        },
        export: {
            permissions: ['ACCOUNT.STORE.EXPORT'],
            useAdvanced: true,
            pageType: 'stores'
        },
        import: {
            permissions: ['ACCOUNT.STORE.IMPORT'],
            useAdvanced: true,
            pageType: 'stores'
        }
    };

    // search: FormControl = new FormControl('');
    total: number;
    displayedColumns = [
        'checkbox',
        'store-code',
        'name',
        'city',
        'address',
        // 'store-phone-no',
        'owner-phone-no',
        'owner-name',
        // 'store-segment',
        // 'store-type',
        // 'sr-name',
        'joining-date',
        'status',
        'supplier-status',
        'actions'
    ];
    resendStoreColumns: Array<string> = [
        'name',
        'owner-name',
        'city',
        'owner-phone-no'
    ];
    importBtnConfig: IButtonImportConfig = {
        id: 'import-journey-plan',
        cssClass: 'sinbad',
        color: 'accent',
        dialogConf: {
            title: 'Import',
            cssToolbar: 'fuse-white-bg'
        },
        title: 'IMPORT ADV',
        type: ButtonDesignType.MAT_STROKED_BUTTON
    };

    dataSource$: Observable<Array<SupplierStore>>;
    selectedRowIndex$: Observable<string>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('resendStore', { static: false }) resendStore: TemplateRef<any>;

    // @ViewChild('filter', { static: true })
    // filter: ElementRef;

    dialogStoreType: ApplyDialogService;
    private trigger$: BehaviorSubject<string> = new BehaviorSubject<string>('empty');
    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        private router: Router,
        private ngxPermissions: NgxPermissionsService,
        private ngxRoles: NgxRolesService,
        private store: Store<fromMerchant.FeatureState>,
        public translate: TranslateService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$helper: HelperService,
        private _$notice: NoticeService,
        private cdRef: ChangeDetectorRef,
        private applyDialogFactory$: ApplyDialogFactoryService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home'
                        // translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Store',
                        translate: 'BREADCRUMBS.ACCOUNT'
                    },
                    {
                        title: 'Store List',
                        translate: 'BREADCRUMBS.STORE',
                        active: true
                    }
                ]
            })
        );
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

    get searchStore(): string {
        return localStorage.getItem('filter.store') || '';
    }

    goStoreInfoPage(storeId: string, supplierStore: SupplierStore): void {
        if (!storeId) {
            return;
        }

        this.store.dispatch(StoreActions.selectSupplierStore({ payload: supplierStore }));
        this.store.dispatch(StoreActions.goPage({ payload: 'info' }));
        this.router.navigate(['/pages/account/stores', storeId, 'detail']);
    }

    safeValue(item: string): string {
        return item ? item : '-';
    }

    onChangePage(ev: PageEvent): void {
        console.log('Change page', ev);
    }

    onResendStore(item: SupplierStore): void {
        if (!item || !item.id) {
            return;
        }

        const canChangeStatusStore = this.ngxPermissions.hasPermission('ACCOUNT.STORE.UPDATE');

        canChangeStatusStore.then(hasAccess => {
            if (hasAccess) {
                this.selection.select(item);

                this.dialogStoreType = this.applyDialogFactory$.open(
                    {
                        title: 'Re-send',
                        template: this.resendStore,
                        isApplyEnabled: true,
                    },
                    {
                        disableClose: true,
                        width: '60vw',
                        minWidth: '60vw',
                        maxWidth: '60vw',
                        panelClass: 'dialog-container-no-padding'
                    }
                );

                this.dialogStoreType.closed$.subscribe({
                    next: (value: TNullable<string>) => {
                        HelperService.debug('DIALOG RE-SEND STORE CLOSED', value);
        
                        if (value === 'apply') {
                            this.store.dispatch(StoreActions.resendStoresRequest({
                                payload: this.selection.selected
                            }));
                        }
        
                        this.cdRef.detectChanges();
                    },
                });
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
            }
        });
    }


    onResendStores(): void {
        const canChangeStatusStore = this.ngxPermissions.hasPermission('ACCOUNT.STORE.UPDATE');

        canChangeStatusStore.then(hasAccess => {
            if (hasAccess) {
                this.dialogStoreType = this.applyDialogFactory$.open(
                    {
                        title: 'Re-send',
                        template: this.resendStore,
                        isApplyEnabled: true,
                    },
                    {
                        disableClose: true,
                        width: '60vw',
                        minWidth: '60vw',
                        maxWidth: '60vw',
                        panelClass: 'dialog-container-no-padding'
                    }
                );

                this.dialogStoreType.closed$.subscribe({
                    next: (value: TNullable<string>) => {
                        HelperService.debug('DIALOG RE-SEND STORE CLOSED', value);
        
                        if (value === 'apply') {
                            this.store.dispatch(StoreActions.resendStoresRequest({
                                payload: this.selection.selected
                            }));
                        }
        
                        this.cdRef.detectChanges();
                    },
                });
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
            }
        });
    }

    onChangeStatus(item: SupplierStore): void {
        if (!item || !item.id) {
            return;
        }

        const canChangeStatusStore = this.ngxPermissions.hasPermission('ACCOUNT.STORE.UPDATE');

        canChangeStatusStore.then(hasAccess => {
            if (hasAccess) {
                this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
                this.store.dispatch(StoreActions.confirmChangeStatusStore({ payload: item }));
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
            }
        });
    }

    onDelete(item: SupplierStore): void {
        if (!item || !item.id) {
            return;
        }

        const canDeleteStore = this.ngxPermissions.hasPermission('ACCOUNT.STORE.DELETE');

        canDeleteStore.then(hasAccess => {
            if (hasAccess) {
                this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
                this.store.dispatch(StoreActions.confirmDeleteStore({ payload: item }));
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
            }
        });
    }

    onExport(ev: { action: string; payload: any }): void {
        if (!ev) {
            return;
        }

        const { action, payload } = ev;

        if (action === 'export') {
            const body = {
                status: payload.status,
                dateGte:
                    moment.isMoment(payload.start) && payload.start
                        ? (payload.start as moment.Moment).format('YYYY-MM-DD')
                        : payload.start
                        ? moment(payload.start).format('YYYY-MM-DD')
                        : null,
                dateLte:
                    moment.isMoment(payload.end) && payload.end
                        ? (payload.end as moment.Moment).format('YYYY-MM-DD')
                        : payload.end
                        ? moment(payload.end).format('YYYY-MM-DD')
                        : null
            };

            this.store.dispatch(StoreActions.exportRequest({ payload: body }));
        }
    }

    onRemoveSearchStore(): void {
        localStorage.removeItem('filter.store');
        this.search.reset();
    }

    onTrackBy(index: number, item: SupplierStore): string {
        return !item ? null : item.id;
    }

    generateSalesRep(salesRep: Array<User>): string {
        if (!salesRep || !Array.isArray(salesRep) || salesRep.length === 0) {
            return '-';
        }

        return salesRep.map(sR => sR.fullName).join(',<br/>');
    }

    onSelectedTab(index: number): void {
        // switch (index) {
        //     case 0: this.section = 'all'; break;
        //     case 1: this.section = 'active'; break;
        //     case 2: this.section = 'inactive'; break;
        // }
    }

    handleCheckbox(): void {
        this.isAllSelected()
            ? this.trigger$.next('empty')
            : this.trigger$.next('all');
            // : this.dataSource$
            //     .pipe(
            //         flatMap(v => v),
            //         take(1)
            //     )
            //     .forEach(row => this.selection.select(row));
    }

    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.paginator.length;

        HelperService.debug('IS ALL SELECTED', { selection: this.selection, numSelected, numRows });

        return numSelected === numRows;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     *
     * @private
     * @param {LifecyclePlatform} [lifeCycle]
     * @memberof MerchantsComponent
     */
    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:
                this.sort.sortChange
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => (this.paginator.pageIndex = 0));

                merge(this.sort.sortChange, this.paginator.page)
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => {
                        this._initTable();
                    });

                this.ngxPermissions
                    .hasPermission(['ACCOUNT.STORE.UPDATE', 'ACCOUNT.STORE.DELETE'])
                    .then(hasAccess => {
                        if (hasAccess) {
                            this.displayedColumns = [
                                'checkbox',
                                'store-code',
                                'name',
                                'city',
                                'address',
                                // 'store-phone-no',
                                'owner-phone-no',
                                'owner-name',
                                // 'store-segment',
                                // 'store-type',
                                // 'sr-name',
                                'joining-date',
                                'status',
                                'supplier-status',
                                'actions'
                            ];
                        } else {
                            this.displayedColumns = [
                                'checkbox',
                                'store-code',
                                'name',
                                'city',
                                'address',
                                // 'store-phone-no',
                                'owner-phone-no',
                                'owner-name',
                                // 'store-segment',
                                // 'store-type',
                                // 'sr-name',
                                'joining-date',
                                'status',
                                'supplier-status'
                            ];
                        }
                    });
                break;

            case LifecyclePlatform.OnDestroy:
                // Reset breadcrumb state
                this.store.dispatch(UiActions.resetBreadcrumb());

                // Reset core state stores
                this.store.dispatch(StoreActions.resetStore());

                this.trigger$.next('');
                this.trigger$.complete();

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                this.paginator.pageSize = this.defaultPageSize;

                this.sort.sort({
                    id: 'updated_at',
                    start: 'desc',
                    disableClear: true
                });

                localStorage.removeItem('filter.store');

                this.store.dispatch(StoreActions.deselectSupplierStore());

                // .pipe(
                //     filter(source => source.length > 0),
                //     delay(1000),
                //     startWith(this._$merchantApi.initBrandStore())
                // );

                this.selection = new SelectionModel<SupplierStore>(true, []);
                this.dataSource$ = this.store.select(StoreSelectors.getAllStore);
                this.totalDataSource$ = this.store.select(StoreSelectors.getTotalStore);
                this.selectedRowIndex$ = this.store.select(UiSelectors.getSelectedRowIndex);
                this.isLoading$ = combineLatest([
                    this.store.select(StoreSelectors.getIsLoading),
                    this.store.select(ExportSelector.getRequestingState)
                ]).pipe(map(state => state.includes(true)));

                this._initTable();

                this.selection.changed.pipe(
                    debounceTime(100),
                    tap(value => HelperService.debug('SELECTION CHANGED', value)),
                    takeUntil(this._unSubs$)
                ).subscribe((value: SelectionChange<SupplierStore>) => {
                    if (value.source.isEmpty()) {
                        this.cardHeaderConfig = {
                            ...this.cardHeaderConfig,
                            batchAction: {
                                ...this.cardHeaderConfig.batchAction,
                                show: false
                            }
                        };
                    } else {
                        this.cardHeaderConfig = {
                            ...this.cardHeaderConfig,
                            batchAction: {
                                ...this.cardHeaderConfig.batchAction,
                                show: true
                            }
                        };
                    }

                    this.cdRef.markForCheck();
                });

                this.trigger$.pipe(
                    withLatestFrom(this.dataSource$),
                    takeUntil(this._unSubs$)
                ).subscribe(([trigger, dataSource]) => {
                    if (trigger === 'empty') {
                        this.selection.clear();
                    } else if (trigger === 'all') {
                        dataSource.forEach(source => this.selection.select(source));
                    }
                });

                this.search.valueChanges
                    .pipe(distinctUntilChanged(), debounceTime(1000), takeUntil(this._unSubs$))
                    .subscribe(v => {
                        if (v) {
                            localStorage.setItem('filter.store', v);
                        }

                        this._onRefreshTable();
                    });

                this.store
                    .select(StoreSelectors.getIsRefresh)
                    .pipe(distinctUntilChanged(), takeUntil(this._unSubs$))
                    .subscribe(isRefresh => {
                        if (isRefresh) {
                            this._onRefreshTable();
                        }
                    });
                break;
        }
    }

    private _onRefreshTable(): void {
        this.paginator.pageIndex = 0;
        this._initTable();
    }

    /**
     *
     *
     * @private
     * @memberof MerchantsComponent
     */
    private _initTable(): void {
        const data: IQueryParams = {
            limit: this.paginator.pageSize || 5,
            skip: this.paginator.pageSize * this.paginator.pageIndex || 0
        };

        data['paginate'] = true;

        if (this.sort.direction) {
            data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
            data['sortBy'] = this.sort.active;
        }

        if (this.search.value) {
            const query = this.search.value;

            data['search'] = [
                {
                    fieldName: 'keyword',
                    keyword: query
                }
            ];
        }

        this.store.dispatch(
            StoreActions.fetchStoresRequest({
                payload: data
            })
        );
    }
}
