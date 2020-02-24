import { animate, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    SecurityContext,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, MatSort, MatTable, MatTableDataSource } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { Store } from '@ngrx/store';
import { HelperService, NoticeService } from 'app/shared/helpers';
import { IBreadcrumbs, IQueryParams, LifecyclePlatform, Portfolio } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import { UiSelectors } from 'app/shared/store/selectors';
import { environment } from 'environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil, tap } from 'rxjs/operators';

import { locale as english } from './i18n/en';
import { locale as indonesian } from './i18n/id';
import { SalesRep, SalesRepBatchActions } from './models';
import { SalesRepActions } from './store/actions';
import * as fromSalesReps from './store/reducers';
import { SalesRepSelectors } from './store/selectors';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { Router } from '@angular/router';

@Component({
    selector: 'app-sales-reps',
    templateUrl: './sales-reps.component.html',
    styleUrls: ['./sales-reps.component.scss'],
    animations: [
        fuseAnimations,
        trigger('enterAnimation', [
            transition(':enter', [
                style({ transform: 'translateX(100%)', opacity: 0 }),
                animate('500ms', style({ transform: 'translateX(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                style({ transform: 'translateX(0)', opacity: 1 }),
                animate('500ms', style({ transform: 'translateX(100%)', opacity: 0 }))
            ])
        ])
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesRepsComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    // Untuk menentukan konfigurasi card header.
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Sales Rep'
        },
        search: {
            active: true,
            changed: (value: string) => {
                this.search.setValue(value);
            }
        },
        add: {
            permissions: ['SRM.SR.CREATE'],
            onClick: () => {
                this.router.navigate(['/pages/sales-force/sales-rep/new']);
            }
        },
        export: {
            permissions: ['SRM.SR.EXPORT'],
            useAdvanced: true,
            pageType: 'sales-rep'
        },
        import: {
            permissions: ['SRM.SR.IMPORT'],
            useAdvanced: true,
            pageType: 'sales-rep'
        }
    };

    search: FormControl = new FormControl('');
    displayedColumns = [
        // 'checkbox',
        'sales-rep-id',
        'sales-rep-name',
        'phone-number',
        // 'sales-rep-target',
        // 'actual-sales',
        'invoice-group',
        'area',
        'joining-date',
        'status',
        'actions'
    ];
    dataSource: MatTableDataSource<SalesRep>;
    selection: SelectionModel<SalesRep> = new SelectionModel<SalesRep>(true, []);

    dataSource$: Observable<Array<SalesRep>>;
    selectedRowIndex$: Observable<string>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild('table', { static: true })
    matTable: MatTable<SalesRep>;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private _unSubs$: Subject<void> = new Subject();

    private readonly _breadCrumbs: IBreadcrumbs[] = [
        {
            title: 'Home'
        },
        {
            title: 'Sales Management'
        },
        {
            title: 'Sales Rep'
        }
    ];

    constructor(
        private domSanitizer: DomSanitizer,
        private ngxPermissions: NgxPermissionsService,
        private router: Router,
        private store: Store<fromSalesReps.FeatureState>,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _$helper: HelperService,
        private _$notice: NoticeService
    ) {
        // Load translate
        this._fuseTranslationLoaderService.loadTranslations(indonesian, english);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.paginator.pageSize = this.defaultPageSize;

        this.sort.sort({
            id: 'id',
            start: 'desc',
            disableClear: true
        });

        this._initPage();

        this._initTable();

        this.dataSource$ = this.store.select(SalesRepSelectors.selectAll).pipe(
            tap(source => {
                this.dataSource = new MatTableDataSource(source);
                this.selection.clear();
            })
        );
        this.totalDataSource$ = this.store.select(SalesRepSelectors.getTotalItem);
        this.selectedRowIndex$ = this.store.select(UiSelectors.getSelectedRowIndex);
        this.isLoading$ = this.store.select(SalesRepSelectors.getIsLoading);

        this.search.valueChanges
            .pipe(
                distinctUntilChanged(),
                debounceTime(1000),
                filter(v => {
                    if (v) {
                        return !!this.domSanitizer.sanitize(SecurityContext.HTML, v);
                    }

                    return true;
                }),
                takeUntil(this._unSubs$)
            )
            .subscribe(v => {
                this._onRefreshTable();
            });
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

    handleCheckbox(): void {
        //    if (this.isAllSelected()) {
        //        this.selection.clear();
        //    } else {
        //        // this.dataSource$.pipe(flatMap(v => v)).forEach(row => this.selection.select(row));
        //        this.dataSource.data.forEach(row => this.selection.select(row));
        //    }

        // this.isAllSelected()
        //     ? this.selection.clear()
        //     : this.dataSource$.pipe(flatMap(v => v)).forEach(row => this.selection.select(row));

        this.isAllSelected()
            ? this.selection.clear()
            : this.dataSource.data.forEach(row => this.selection.select(row));
    }

    joinPortfolios(value: Array<Portfolio>): string {
        if (value && value.length > 0) {
            const invoiceGroup = value
                .filter(v => v.type !== 'direct')
                .map(v => v.invoiceGroup.name);

            return invoiceGroup.length > 0 ? invoiceGroup.join(', ') : '-';
        }

        return '-';
    }

    isAllSelected(): boolean {
        // const dataSource = this.matTable.dataSource as Array<SalesRep>;
        const numSelected = this.selection.selected.length;
        // const numRows = dataSource.length;
        const numRows = this.dataSource.data.length;
        // const numRows = this.paginator.length;

        // console.log('IS ALL SELECTED', numSelected, numRows);

        return numSelected === numRows;
    }

    showInfo(): void {
        this._$helper.infoNotice();
    }

    onChangeStatus(item: SalesRep): void {
        if (!item || !item.id) {
            return;
        }

        const canUpdate = this.ngxPermissions.hasPermission('SRM.SR.UPDATE');

        canUpdate.then(hasAccess => {
            if (hasAccess) {
                this.store.dispatch(UiActions.setHighlightRow({ payload: item.id }));
                this.store.dispatch(SalesRepActions.confirmChangeStatusSalesRep({ payload: item }));
            } else {
                this._$notice.open('Sorry, permission denied!', 'error', {
                    verticalPosition: 'bottom',
                    horizontalPosition: 'right'
                });
            }
        });
    }

    onSelectedActions(action: SalesRepBatchActions): void {
        if (!action) {
            return;
        }

        switch (action) {
            case SalesRepBatchActions.ACTIVE:
                {
                    const ids = this.selection.selected.map(r => r.id);

                    if (ids && ids.length > 0) {
                        this.store.dispatch(
                            SalesRepActions.batchSetActiveSalesRepsRequest({
                                payload: { ids, status: SalesRepBatchActions.ACTIVE }
                            })
                        );
                    }
                }
                break;

            case SalesRepBatchActions.INACTIVE:
                {
                    const ids = this.selection.selected.map(r => r.id);

                    if (ids && ids.length > 0) {
                        this.store.dispatch(
                            SalesRepActions.batchSetInactiveSalesRepsRequest({
                                payload: { ids, status: SalesRepBatchActions.INACTIVE }
                            })
                        );
                    }
                }
                break;

            case SalesRepBatchActions.DELETE:
                {
                    const ids = this.selection.selected.map(r => r.id);

                    if (ids && ids.length > 0) {
                        this.store.dispatch(
                            SalesRepActions.batchDeleteSalesRepsRequest({
                                payload: { ids, status: SalesRepBatchActions.DELETE }
                            })
                        );
                    }
                }
                break;

            default:
                return;
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     *
     * Initialize current page
     * @private
     * @param {LifecyclePlatform} [lifeCycle]
     * @memberof SalesRepsComponent
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
                        // this.table.nativeElement.scrollIntoView(true);
                        this.table.nativeElement.scrollTop = 0;
                        this._initTable();
                    });

                const canUpdate = this.ngxPermissions.hasPermission('SRM.SR.UPDATE');

                canUpdate.then(hasAccess => {
                    if (hasAccess) {
                        this.displayedColumns = [
                            // 'checkbox',
                            'sales-rep-id',
                            'sales-rep-name',
                            'phone-number',
                            // 'sales-rep-target',
                            // 'actual-sales',
                            'invoice-group',
                            'area',
                            'joining-date',
                            'status',
                            'actions'
                        ];
                    } else {
                        this.displayedColumns = [
                            // 'checkbox',
                            'sales-rep-id',
                            'sales-rep-name',
                            'phone-number',
                            // 'sales-rep-target',
                            // 'actual-sales',
                            'invoice-group',
                            'area',
                            'joining-date',
                            'status'
                        ];
                    }
                });
                break;

            case LifecyclePlatform.OnDestroy:
                // Reset core state sales reps
                this.store.dispatch(SalesRepActions.clearState());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                // Set breadcrumbs
                this.store.dispatch(
                    UiActions.createBreadcrumb({
                        payload: this._breadCrumbs
                    })
                );
                break;
        }
    }

    private _initTable(): void {
        if (this.paginator) {
            const data: IQueryParams = {
                limit: this.paginator.pageSize || 5,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0
            };

            data['paginate'] = true;

            if (this.sort.direction) {
                data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
                data['sortBy'] = this.sort.active;
            }

            const query = this.domSanitizer.sanitize(SecurityContext.HTML, this.search.value);

            if (query) {
                localStorage.setItem('filter.search.salesreps', query);

                data['search'] = [
                    {
                        fieldName: 'keyword',
                        keyword: query
                    }
                ];
            } else {
                localStorage.removeItem('filter.search.salesreps');
            }

            this.store.dispatch(SalesRepActions.fetchSalesRepsRequest({ payload: data }));
        }
    }

    private _onRefreshTable(): void {
        this._initTable();
    }
}
