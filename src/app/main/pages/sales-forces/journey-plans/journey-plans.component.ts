import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    SecurityContext,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { HelperService, WINDOW } from 'app/shared/helpers';
import { ButtonDesignType } from 'app/shared/models/button.model';
import { IBreadcrumbs, LifecyclePlatform } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, take, takeUntil, tap } from 'rxjs/operators';

import { IButtonImportConfig } from './../../../../shared/components/import-advanced/models/import-advanced.model';
import { ExportFilterComponent } from './components';
import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { JourneyPlan, ViewBy } from './models';
import { JourneyPlanSales } from './models/journey-plan-sales.model';
import { JourneyPlanActions, JourneyPlanSalesActions } from './store/actions';
import * as fromJourneyPlans from './store/reducers';
import { JourneyPlanSalesSelectors, JourneyPlanSelectors } from './store/selectors';

@Component({
    selector: 'app-journey-plans',
    templateUrl: './journey-plans.component.html',
    styleUrls: ['./journey-plans.component.scss'],
    animations: [
        fuseAnimations,
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JourneyPlansComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Journey Plan',
        },
        search: {
            active: true,
            changed: (value: string) => {
                this.search.setValue(value);
            },
        },
        // add: {
        //     permissions: ['SRM.JP.CREATE'],
        //     onClick: () => {
        //         this.router.navigate(['/pages/sales-force/journey-plans/new']);
        //     }
        // },
        viewBy: {
            list: [{ id: 'date-sales-rep', label: 'Date - Sales Rep' }],
        },
        export: {
            permissions: ['SRM.JP.EXPORT'],
            useAdvanced: true,
            pageType: 'journey-plans',
        },
        import: {
            permissions: ['SRM.JP.IMPORT'],
            useAdvanced: true,
            pageType: 'journey-plans',
        },
    };

    search: FormControl = new FormControl('');

    displayedColumns = [
        // 'checkbox',
        'expand-action',
        'visit-date',
        'sales-rep-id',
        'sales-rep-name',
        'store-id',
        'store-name',
        'reason-no-order',
        'actions',
    ];
    detailDisplayedColumns = [
        // 'checkbox',
        'expand-action',
        'visit-date',
        'sales-rep-id',
        'sales-rep-name',
        'store-id',
        'store-name',
        'reason-no-order',
        'actions',
    ];
    importBtnConfig: IButtonImportConfig = {
        id: 'import-journey-plan',
        cssClass: 'sinbad',
        color: 'accent',
        dialogConf: {
            title: 'Import',
            cssToolbar: 'fuse-white-bg',
        },
        title: 'IMPORT ADV',
        type: ButtonDesignType.MAT_STROKED_BUTTON,
    };

    dataSource: MatTableDataSource<JourneyPlan>;
    selection: SelectionModel<JourneyPlan> = new SelectionModel<JourneyPlan>(true, []);

    dataSource$: Observable<Array<JourneyPlan>>;
    detailDataSource$: Observable<Array<JourneyPlanSales>>;
    expandedElement: JourneyPlan | null;
    selectedRowIndex$: Observable<string>;
    totalDataSource$: Observable<number>;
    totalDetailDataSource$: Observable<number>;
    viewBy$: Observable<ViewBy>;
    isLoading$: Observable<boolean>;

    ViewByRes = ViewBy;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private _unSubs$: Subject<void> = new Subject<void>();

    private readonly _breadCrumbs: Array<IBreadcrumbs> = [
        {
            title: 'Home',
        },
        {
            title: 'Sales Management',
        },
        {
            title: 'Journey Plan',
        },
    ];

    constructor(
        @Inject(WINDOW) private $window: Window,
        private router: Router,
        private domSanitizer: DomSanitizer,
        private matDialog: MatDialog,
        private store: Store<fromJourneyPlans.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$helper: HelperService
    ) {}

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

    getExpandedDetail(item: JourneyPlan): void {}

    getTotal(item: JourneyPlan, key: string): string {
        if (!item || !key) {
            return '-';
        }

        if (key === 'journeyPlanSales' && item.hasOwnProperty('journeyPlanSales')) {
            return item && item.journeyPlanSales && item.journeyPlanSales.length > 0
                ? `#${(item[key] as JourneyPlanSales[]).length}`
                : '#0';
        }

        return '-';
    }

    getTotalNumberReasonNoOrder(item: JourneyPlan): string {
        if (item.hasOwnProperty('journeyPlanSales')) {
            let numReasonNotOrder = 0;

            item.journeyPlanSales.forEach((journeyPlanSale) => {
                journeyPlanSale.journeyPlanSaleLogs.forEach((journeyPlanSaleLog) => {
                    if (journeyPlanSaleLog.activity === 'check_out') {
                        if (journeyPlanSaleLog.noOrderReasons !== null) {

                            numReasonNotOrder++;
                        }
                    }
                });
            })
            return `#${numReasonNotOrder}`;
        }

        return '-';
    }

    getReasonNoOrder(item: JourneyPlanSales): string {
        let reason = '-';

        if (item.hasOwnProperty('journeyPlanSaleLogs')) {
            let nFound = 0;
            item.journeyPlanSaleLogs.every((journeyPlanSaleLog) => {
                if (journeyPlanSaleLog.activity === 'check_out') {
                    if (journeyPlanSaleLog.noOrderReasons !== null) {
                        nFound++;
                        reason = `${journeyPlanSaleLog.noOrderReasons.reason} | ${journeyPlanSaleLog.noOrderNotes}`;
                    }
                }

                return nFound > 0;
            });
        }

        return reason;
    }

    handleCheckbox(): void {
        this.isAllSelected()
            ? this.selection.clear()
            : this.dataSource.data.forEach((row) => this.selection.select(row));
    }

    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;

        return numSelected === numRows;
    }

    showInfo(): void {
        this._$helper.infoNotice();
    }

    onActions(action: string): void {
        if (!action) {
            return;
        }

        switch (action) {
            case 'export':
                {
                    const dialogRef = this.matDialog.open<
                        ExportFilterComponent,
                        any,
                        { payload: any }
                    >(ExportFilterComponent, {
                        data: {
                            dialog: {
                                title: 'Filter Export',
                            },
                        },
                        panelClass: 'event-form-dialog',
                        disableClose: true,
                    });

                    dialogRef
                        .afterClosed()
                        .pipe(take(1), takeUntil(this._unSubs$))
                        .subscribe((resp) => {
                            if (!resp) {
                                return;
                            }

                            const { payload } = resp;

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

                            if (payload) {
                                this.store.dispatch(
                                    JourneyPlanActions.exportRequest({ payload: body })
                                );
                            }
                        });
                }
                break;

            default:
                return;
        }
    }

    onDelete(item: JourneyPlan): void {
        if (!item || !item.id) {
            return;
        }

        this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
        this.store.dispatch(JourneyPlanActions.confirmDeleteJourneyPlan({ payload: item }));
    }

    onDownload(): void {
        this.$window.open(
            'https://sinbad-website-sg.s3-ap-southeast-1.amazonaws.com/dev/template_upload/Journey+Plans.zip',
            '_blank'
        );
    }

    onExpandedRow(item: JourneyPlan): void {
        this.expandedElement = this.expandedElement === item || !item ? null : item;

        if (this.expandedElement) {
            this.store.dispatch(
                JourneyPlanSalesActions.setJourneyPlanSales({ payload: item.journeyPlanSales })
            );
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
                            JourneyPlanActions.importRequest({
                                payload: { file, type: 'insert_journey_plans' },
                            })
                        );
                        break;

                    default:
                        break;
                }
            }
        }
    }

    onSetViewBy(viewBy: ViewBy): void {
        if (!viewBy) {
            return;
        }

        switch (viewBy) {
            case ViewBy.DATE:
                this.store.dispatch(JourneyPlanActions.setViewBy(ViewBy.DATE));
                break;

            case ViewBy.SALES_REP:
                this.store.dispatch(JourneyPlanActions.setViewBy(ViewBy.SALES_REP));
                break;

            case ViewBy.STORE:
                this.store.dispatch(JourneyPlanActions.setViewBy(ViewBy.STORE));
                break;

            default:
                return;
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    private _initPage(lifeCycle?: LifecyclePlatform): void {
        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: this._breadCrumbs,
            })
        );

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
                break;

            case LifecyclePlatform.OnDestroy:
                // Reset core state sales reps
                this.store.dispatch(JourneyPlanActions.clearState());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                // Load translate
                this._fuseTranslationLoaderService.loadTranslations(indonesian, english);

                this.paginator.pageSize = this.defaultPageSize;
                this.sort.sort({
                    id: 'id',
                    start: 'desc',
                    disableClear: true,
                });

                this._initTable();

                this.store.dispatch(JourneyPlanActions.setViewBy(ViewBy.DATE));

                this.dataSource$ = this.store.select(JourneyPlanSelectors.selectAll).pipe(
                    tap((source) => {
                        this.dataSource = new MatTableDataSource(source);
                        this.selection.clear();
                    })
                );
                this.totalDataSource$ = this.store.select(JourneyPlanSelectors.getTotalItem);
                this.selectedRowIndex$ = this.store.select(UiSelectors.getSelectedRowIndex);

                this.detailDataSource$ = this.store.select(JourneyPlanSalesSelectors.selectAll);
                this.totalDetailDataSource$ = this.store.select(
                    JourneyPlanSalesSelectors.selectTotal
                );

                this.viewBy$ = this.store.select(JourneyPlanSelectors.getViewBy);

                this.isLoading$ = this.store.select(JourneyPlanSelectors.getIsLoading);

                this.search.valueChanges
                    .pipe(
                        distinctUntilChanged(),
                        debounceTime(1000),
                        filter((v) => {
                            if (v) {
                                return !!this.domSanitizer.sanitize(SecurityContext.HTML, v);
                            }

                            return true;
                        }),
                        takeUntil(this._unSubs$)
                    )
                    .subscribe((v) => {
                        this._onRefreshTable();
                    });
                break;
        }
    }

    private _initTable(): void {
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
                localStorage.setItem('filter.search.journeyplans', query);

                data['search'] = [
                    {
                        fieldName: 'keyword',
                        keyword: query,
                    },
                ];
            } else {
                localStorage.removeItem('filter.search.journeyplans');
            }

            this.store.dispatch(JourneyPlanActions.fetchJourneyPlansRequest({ payload: data }));
        }
    }

    private _onRefreshTable(): void {
        this._initTable();
    }
}
