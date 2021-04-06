import {
    AfterViewInit,
    Component,
    OnDestroy,
    OnInit,
    SecurityContext,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DomSanitizer } from '@angular/platform-browser';
import { fuseAnimations } from '@fuse/animations';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FuseNavigation } from '@fuse/types';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { fromExport } from 'app/shared/components/exports/store/reducers';
import { ExportSelector } from 'app/shared/components/exports/store/selectors';
import { IButtonImportConfig } from 'app/shared/components/import-advanced/models';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { ButtonDesignType } from 'app/shared/models/button.model';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import { NgxPermissionsService } from 'ngx-permissions';
import { combineLatest, merge, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { statusOrder } from './status';
import { OrderActions } from './store/actions';
import { fromOrder } from './store/reducers';
import { OrderSelectors } from './store/selectors';

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class OrdersComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = 25;
    readonly defaultPageOpts = environment.pageSizeTable;

    allOrder: number;
    newOrder: number;
    packedOrder: number;
    shippedOrder: number;
    deliveredOrder: number;
    completedOrder: number;
    pendingOrder: number;
    canceledOrder: number;
    pendingPayment: number;
    selectedTab: string;

    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Order Management',
        },
        search: {
            active: true,
            changed: (value: string) => {
                this.search.setValue(value);
                setTimeout(() => this._onRefreshTable(), 100);
            },
        },
        add: {
            // permissions: ['INVENTORY.ISI.CREATE'],
        },
        export: {
            permissions: ['OMS.EXPORT'],
            useAdvanced: true,
            pageType: 'orders',
        },
        import: {
            permissions: ['OMS.IMPORT'],
            useAdvanced: true,
            pageType: 'orders',
        },
    };

    search: FormControl = new FormControl('');
    filterStatus = '';
    formConfig = {
        status: {
            label: 'Order Status',
            placeholder: 'Choose Order Status',
            sources: this._$helper.orderStatus(),
            rules: {
                required: true,
            },
        },
        startDate: {
            label: 'Start Date',
            rules: {
                required: true,
            },
        },
        endDate: {
            label: 'End Date',
            rules: {
                required: true,
            },
        },
    };
    total: number;
    displayedColumns = [
        // 'checkbox',
        'order-code',
        'order-ref',
        'order-date',
        'store-name',
        'trx-amount',
        'payment-method',
        'paylater-type',
        'total-product',
        'status',
        // 'deliveredOn',
        // 'actual-amount-delivered',
        'delivered-date',
        'actions',
    ];
    importBtnConfig: IButtonImportConfig = {
        id: 'import-oms',
        cssClass: 'sinbad',
        color: 'accent',
        dialogConf: {
            title: 'Import',
            cssToolbar: 'fuse-white-bg',
        },
        title: 'IMPORT',
        type: ButtonDesignType.MAT_STROKED_BUTTON,
    };
    hasSelected = false;
    statusOrder: any;

    dataSource$: Observable<any>;
    selectedRowIndex$: Observable<string>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;
    isRequestingExport$: Observable<boolean>;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    // @ViewChild('filter', { static: true })
    // filter: ElementRef;

    private _unSubs$: Subject<any> = new Subject<any>();

    constructor(
        private domSanitizer: DomSanitizer,
        private ngxPermissions: NgxPermissionsService,
        private store: Store<fromOrder.FeatureState>,
        private exportStore: Store<fromExport.State>,
        public translate: TranslateService,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$helper: HelperService,
        private _$notice: NoticeService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                        // translate: 'BREADCRUMBS.HOME'
                    },
                    {
                        title: 'Order Managements',
                        translate: 'BREADCRUMBS.ORDER_MANAGEMENTS',
                    },
                ],
            })
        );

        this.statusOrder = statusOrder;
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

    get searchOrder(): string {
        return localStorage.getItem('filter.search.order') || '';
    }

    get searchStatus(): string {
        return localStorage.getItem('filter.order') || '';
    }

    onSelectedTab(index: number): void {
        switch (index) {
            case 1:
                this.selectedTab = 'pending';
                this._onRefreshTable();
                break;

            case 2:
                this.selectedTab = 'pending_payment';
                this._onRefreshTable();
                break;

            case 3:
                this.selectedTab = 'confirm';
                this._onRefreshTable();
                break;

            case 4:
                this.selectedTab = 'packing';
                this._onRefreshTable();
                break;

            case 5:
                this.selectedTab = 'shipping';
                this._onRefreshTable();
                break;

            case 6:
                this.selectedTab = 'delivered';
                this._onRefreshTable();
                break;

            case 7:
                this.selectedTab = 'done';
                this._onRefreshTable();
                break;

            case 8:
                this.selectedTab = 'cancel';
                this._onRefreshTable();
                break;

            default:
                this.selectedTab = '';
                this._onRefreshTable();
                break;
        }
    }

    safeValue(item: any): any {
        return item ? item : '-';
    }

    onChangeCancelStatus(item: any): void {
        if (!item || !item.id || (item.status !== 'confirm' && item.status !== 'pending_payment')) {
            return;
        }

        const canUpdate = this.ngxPermissions.hasPermission('OMS.UPDATE');

        canUpdate.then((hasAccess) => {
            if (hasAccess) {
                this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
                this.store.dispatch(OrderActions.confirmChangeCancelStatusOrder({ payload: item }));
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right',
                });
            }
        });
    }

    onChangeStatus(item: any): void {
        if (!item || !item.id) {
            return;
        }

        const canUpdate = this.ngxPermissions.hasPermission('OMS.UPDATE');

        canUpdate.then((hasAccess) => {
            if (hasAccess) {
                this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
                this.store.dispatch(OrderActions.confirmChangeStatusOrder({ payload: item }));
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right',
                });
            }
        });
    }

    onDelete(item): void {
        if (!item) {
            return;
        }
    }

    onDownload(): void {
        window.open(
            'https://sinbad-website-sg.s3-ap-southeast-1.amazonaws.com/dev/template_upload/Order+Status.zip',
            '_blank'
        );
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
                        : null,
            };

            // this.store.dispatch(OrderActions.exportRequest({ payload: body }));
            // this.exportStore.dispatch(
            //     ExportActions.startExportRequest({
            //         payload: {
            //             ...body,
            //             page: 'oms',
            //             configuration: {}
            //         }
            //     })
            // );
        }
    }

    onFileBrowse(ev: Event, type: string): void {
        const inputEl = ev.target as HTMLInputElement;

        if (inputEl.files && inputEl.files.length > 0) {
            const file = inputEl.files[0];

            if (file) {
                switch (type) {
                    case 'docs':
                        this.store.dispatch(
                            OrderActions.importRequest({
                                payload: { file, type: 'update_order_status' },
                            })
                        );
                        // {
                        //     const photoField = this.form.get('profileInfo.photos');
                        //     const fileReader = new FileReader();
                        //     fileReader.onload = () => {
                        //         photoField.patchValue(fileReader.result);
                        //         this.tmpPhoto.patchValue(file.name);
                        //     };
                        //     fileReader.readAsDataURL(file);
                        // }
                        break;

                    default:
                        break;
                }
            }
        }
    }

    onRemoveSearchStatus(): void {
        // this.store.dispatch(UiActions.setCustomToolbarActive({ payload: 'all-status' }));
    }

    onRemoveSearchOrder(): void {
        localStorage.removeItem('filter.search.order');
        this.search.reset();
    }

    onTrackBy(index: number, item: any): string {
        return !item ? null : item.id;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        switch (lifeCycle) {
            case LifecyclePlatform.AfterViewInit:
                // Set default first status active
                // this.store.dispatch(
                //     UiActions.setCustomToolbarActive({
                //         payload: 'all-status',
                //     })
                // );

                // Register to navigation [FuseNavigation]
                // this.store.dispatch(
                //     UiActions.registerNavigation({
                //         payload: { key: 'customNavigation', navigation: this.statusOrder },
                //     })
                // );

                // Show custom toolbar
                // this.store.dispatch(UiActions.showCustomToolbar());

                this.sort.sortChange
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => (this.paginator.pageIndex = 0));

                merge(this.sort.sortChange, this.paginator.page)
                    .pipe(takeUntil(this._unSubs$))
                    .subscribe(() => {
                        this._initTable();
                    });

                const canUpdate = this.ngxPermissions.hasPermission('OMS.UPDATE');

                canUpdate.then((hasAccess) => {
                    if (hasAccess) {
                        this.displayedColumns = [
                            // 'checkbox',
                            'order-code',
                            'order-ref',
                            'order-date',
                            'store-name',
                            'trx-amount',
                            'payment-method',
                            'paylater-type',
                            'total-product',
                            'status',
                            // 'deliveredOn',
                            // 'actual-amount-delivered',
                            'delivered-date',
                            'actions',
                        ];
                    } else {
                        this.displayedColumns = [
                            // 'checkbox',
                            'order-code',
                            'order-ref',
                            'order-date',
                            'store-name',
                            'trx-amount',
                            'payment-method',
                            'paylater-type',
                            'total-product',
                            'status',
                            // 'deliveredOn',
                            // 'actual-amount-delivered',
                            'delivered-date',
                        ];
                    }
                });
                break;

            case LifecyclePlatform.OnDestroy:
                localStorage.removeItem('filter.order');
                localStorage.removeItem('filter.search.order');

                // Reset breadcrumb state
                this.store.dispatch(UiActions.resetBreadcrumb());

                // Reset custom toolbar state
                this.store.dispatch(UiActions.hideCustomToolbar());

                // Unregister navigation [FuseNavigation]
                this.store.dispatch(
                    UiActions.unregisterNavigation({ payload: 'customNavigation' })
                );

                // Reset orders state
                this.store.dispatch(OrderActions.resetOrders());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                this.paginator.pageSize = this.defaultPageSize;
                this.sort.sort({
                    id: 'id',
                    start: 'desc',
                    disableClear: true,
                });

                localStorage.removeItem('filter.order');

                this.dataSource$ = this.store.select(OrderSelectors.getAllOrder);
                this.totalDataSource$ = this.store.select(OrderSelectors.getTotalOrder);
                this.selectedRowIndex$ = this.store.select(UiSelectors.getSelectedRowIndex);

                this.isLoading$ = this.store.select(OrderSelectors.getIsLoading);
                this.isRequestingExport$ = this.exportStore.select(
                    ExportSelector.getRequestingState
                );

                this._initStatusOrder();

                // combineLatest([
                //     this.store.select(OrderSelectors.getTotalAllOrder),
                //     this.store.select(OrderSelectors.getTotalNewOrder),
                //     this.store.select(OrderSelectors.getTotalPackedOrder),
                //     this.store.select(OrderSelectors.getTotalShippedOrder),
                //     this.store.select(OrderSelectors.getTotalDeliveredOrder),
                //     this.store.select(OrderSelectors.getTotalCompletedOrder),
                //     this.store.select(OrderSelectors.getTotalPendingOrder),
                //     this.store.select(OrderSelectors.getTotalCanceledOrder),
                // ])
                //     .pipe(takeUntil(this._unSubs$))
                //     .subscribe(
                //         ([
                //             allOrder,
                //             newOrder,
                //             packedOrder,
                //             shippedOrder,
                //             deliveredOrder,
                //             completedOrder,
                //             pendingOrder,
                //             canceledOrder,
                //         ]) => {
                //             if (typeof allOrder !== 'undefined') {
                //                 this._updateStatus(
                //                     'all-status',
                //                     { title: `All (${allOrder})` },
                //                     'customNavigation'
                //                 );
                //             }

                //             if (typeof newOrder !== 'undefined') {
                //                 this._updateStatus(
                //                     'confirm',
                //                     { title: `New Order (${newOrder})` },
                //                     'customNavigation'
                //                 );
                //             }

                //             if (typeof packedOrder !== 'undefined') {
                //                 this._updateStatus(
                //                     'packing',
                //                     { title: `Packed (${packedOrder})` },
                //                     'customNavigation'
                //                 );
                //             }

                //             if (typeof shippedOrder !== 'undefined') {
                //                 this._updateStatus(
                //                     'shipping',
                //                     { title: `Shipped (${shippedOrder})` },
                //                     'customNavigation'
                //                 );
                //             }

                //             if (typeof deliveredOrder !== 'undefined') {
                //                 this._updateStatus(
                //                     'delivered',
                //                     { title: `Delivered (${deliveredOrder})` },
                //                     'customNavigation'
                //                 );
                //             }

                //             if (typeof completedOrder !== 'undefined') {
                //                 this._updateStatus(
                //                     'done',
                //                     { title: `Done (${completedOrder})` },
                //                     'customNavigation'
                //                 );
                //             }

                //             if (typeof pendingOrder !== 'undefined') {
                //                 this._updateStatus(
                //                     'pending',
                //                     { title: `Pending (${pendingOrder})` },
                //                     'customNavigation'
                //                 );
                //             }

                //             if (typeof canceledOrder !== 'undefined') {
                //                 this._updateStatus(
                //                     'cancel',
                //                     { title: `Canceled (${canceledOrder})` },
                //                     'customNavigation'
                //                 );
                //             }
                //         }
                //     );

                this._initTable();

                // this.store
                //     .select(UiSelectors.getCustomToolbarActive)
                //     .pipe(
                //         distinctUntilChanged(),
                //         debounceTime(1000),
                //         filter((v) => !!v),
                //         takeUntil(this._unSubs$)
                //     )
                //     .subscribe((v) => {
                //         const currFilter = localStorage.getItem('filter.order');

                //         if (v !== 'all-status') {
                //             localStorage.setItem('filter.order', v);
                //             this.filterStatus = v;
                //         } else {
                //             localStorage.removeItem('filter.order');
                //             this.filterStatus = '';
                //         }

                //         if (this.filterStatus || (currFilter && currFilter !== this.filterStatus)) {
                //             this.store.dispatch(OrderActions.filterOrder({ payload: v }));
                //         }
                //     });

                // Filter by search column
                // this.search.valueChanges
                //     .pipe(
                //         distinctUntilChanged(),
                //         debounceTime(1000),
                //         // filter(v => {
                //         //     if (v) {
                //         //         return !!this.domSanitizer.sanitize(SecurityContext.HTML, v);
                //         //     }

                //         //     return true;
                //         // }),
                //         takeUntil(this._unSubs$)
                //     )
                //     .subscribe(v => {
                //         if (v) {
                //             // localStorage.setItem('filter.search.order', v);
                //         }

                //         this._onRefreshTable();
                //     });

                this.store
                    .select(OrderSelectors.getIsRefresh)
                    .pipe(distinctUntilChanged(), takeUntil(this._unSubs$))
                    .subscribe((isRefresh) => {
                        if (isRefresh) {
                            this._onRefreshTable();
                        }
                    });
                break;
        }
    }

    private _initTable(): void {
        const data: IQueryParams = {
            limit: this.paginator.pageSize || 5,
            skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
            // isWaitingForPayment: this.selectedTab === 'waiting_for_payment'
        };

        data['paginate'] = true;
        data['listEndpoint'] = true;

        // if (this.sort.direction) {
        //     data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
        //     data['sortBy'] = this.sort.active;
        // }

        const query = this.domSanitizer.sanitize(SecurityContext.HTML, this.search.value);

        if (query) {
            if (data['search'] && data['search'].length > 0) {
                data['search'].push({
                    fieldName: 'keyword',
                    keyword: query,
                });
            } else {
                data['search'] = [
                    {
                        fieldName: 'keyword',
                        keyword: query,
                    },
                ];
            }
        }

        // if (this.selectedTab) {
        //     if (data['search'] && data['search'].length > 0) {
        //         if (this.selectedTab !== 'waiting_for_payment') {
        //             data['search'].push({
        //                 fieldName: 'status',
        //                 keyword: this.selectedTab
        //             });
        //         } else {
        //             data['limit'] = 900;
        //         }
        //     } else {
        //         if (this.selectedTab !== 'waiting_for_payment') {
        //             data['search'] = [
        //                 {
        //                     fieldName: 'status',
        //                     keyword: this.selectedTab
        //                 }
        //             ];
        //         } else {
        //             data['limit'] = 900;
        //         }
        //     }
        // }

        if (this.selectedTab) {
            if (data['search'] && data['search'].length > 0) {
                data['search'].push({
                    fieldName: 'status',
                    keyword: this.selectedTab,
                });
            } else {
                data['search'] = [
                    {
                        fieldName: 'status',
                        keyword: this.selectedTab,
                    },
                ];
            }
        }

        this.store.dispatch(OrderActions.fetchOrdersRequest({ payload: data }));
    }

    private _onRefreshTable(): void {
        this.paginator.pageIndex = 0;

        this.store.dispatch(OrderActions.fetchCalculateOrdersRequest());
        this._initTable();
    }

    private _initStatusOrder(): void {
        this.store.dispatch(OrderActions.fetchCalculateOrdersRequest());

        combineLatest([
            this.store.select(OrderSelectors.getTotalAllOrder),
            this.store.select(OrderSelectors.getTotalNewOrder),
            this.store.select(OrderSelectors.getTotalPackedOrder),
            this.store.select(OrderSelectors.getTotalShippedOrder),
            this.store.select(OrderSelectors.getTotalDeliveredOrder),
            this.store.select(OrderSelectors.getTotalCompletedOrder),
            this.store.select(OrderSelectors.getTotalPendingOrder),
            this.store.select(OrderSelectors.getTotalCanceledOrder),
            this.store.select(OrderSelectors.getTotalPendingPayment),
        ])
            .pipe(takeUntil(this._unSubs$))
            .subscribe(
                ([
                    allOrder,
                    newOrder,
                    packedOrder,
                    shippedOrder,
                    deliveredOrder,
                    completedOrder,
                    pendingOrder,
                    canceledOrder,
                    pendingPayment,
                ]) => {
                    this.allOrder = +allOrder;
                    this.newOrder = +newOrder;
                    this.packedOrder = +packedOrder;
                    this.shippedOrder = +shippedOrder;
                    this.deliveredOrder = +deliveredOrder;
                    this.completedOrder = +completedOrder;
                    this.pendingOrder = +pendingOrder;
                    this.canceledOrder = +canceledOrder;
                    this.pendingPayment = +pendingPayment;
                    // this.cdRef.markForCheck();
                }
            );
    }

    private _updateStatus(id: string, properties: Partial<FuseNavigation>, key?: string): void {
        // this.store.dispatch(
        //     UiActions.updateItemNavigation({
        //         payload: {
        //             id,
        //             properties,
        //             key,
        //         },
        //     })
        // );
    }
}
