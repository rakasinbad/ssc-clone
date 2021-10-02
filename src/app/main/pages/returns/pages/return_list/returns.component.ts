import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Component, OnDestroy, OnInit, SecurityContext, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormBuilder, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { UiActions } from 'app/shared/store/actions';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { SinbadFilterService } from 'app/shared/components/sinbad-filter/services';
import { IQueryParams, IQuerySearchParams } from 'app/shared/models/query.model';
import { ReturnsComponentState } from './returns.component.state';
import { returnsReducer } from '../../store/reducers';
import { ReturnsSelector } from '../../store/selectors';
import { ReturnActions } from '../../store/actions';
import { IReturnLine, ITotalReturnModel } from '../../models';

@Component({
    selector: 'app-returns',
    templateUrl: './returns.component.html',
    styleUrls: ['./returns.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class ReturnsComponent implements OnInit, OnDestroy {

    constructor(
        private store: Store<returnsReducer.FeatureState>,
        private route: ActivatedRoute,

        private fuseSidebarService: FuseSidebarService,
        private sinbadFilterService: SinbadFilterService,
        private formBuilder: FormBuilder,

        private domSanitizer: DomSanitizer,
    )
    {
        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: [
                    {
                        title: 'Home',
                    },
                    {
                        title: 'Return Management',
                    },
                ]
            })
        );

        this.cardHeaderConfig = {
            title: {
                label: 'Return Management',
            },
            search: {
                active: true,
                changed: (value: string) => {
                    this._searchKeyword.setValue(value);

                    setTimeout(() => this.loadData(true), 250);
                },
            },
            filter: {
                permissions: [],
                onClick: () => {
                    this.fuseSidebarService.getSidebar('sinbadFilter').toggleOpen();
                }
            },
        };

        this.displayedColumns = [
            'return-date',
            'store-name',
            'return-number',
            'amount',
            'user-name',
            'status',
            'actions',
        ];

        try {
            this.defaultPageSize = this.route.snapshot.queryParams.limit || 25;
            this.defaultPageOpts = environment.pageSizeTable;
        } catch (e) {
            this.defaultPageSize = 25;
            this.defaultPageOpts = null;
        }

        this.$pageState = new ReturnsComponentState();
    }

    dataSource$: Observable<any>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    totalStatus$: Observable<ITotalReturnModel>;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private _unSubscribe$: Subject<any> = new Subject<any>();

    readonly displayedColumns;
    readonly cardHeaderConfig: ICardHeaderConfiguration;

    readonly defaultPageSize;
    readonly defaultPageOpts;

    private filterForm;

    private $pageState: ReturnsComponentState;

    private readonly _searchKeyword: FormControl = new FormControl('');

    ngOnInit(): void {
        this.filterForm = this.formBuilder.group({
            startDate: null,
            endDate: null,
            keyword: null,
        });

        const filterConfig = {
            by: {
                date: {
                    title: 'Return Date',
                    sources: null,
                },
            },
            showFilter: true,
        };

        this.sinbadFilterService.setConfig({ ...filterConfig, form: this.filterForm });

        this.sinbadFilterService
            .getClickAction$()
            .pipe(
                filter((action) => action === 'reset' || action === 'submit'),
                takeUntil(this._unSubscribe$)
            )
            .subscribe((action) => {
                if (action === 'reset') {
                    this.filterForm.reset();

                    this.$pageState.setDate(null, null);
                } else {
                    const {
                        startDate,
                        endDate,
                    } = this.filterForm.value;

                    this.$pageState.setDate(startDate, endDate);
                }

                this.loadData(true);
            });

        this.store
            .select(ReturnsSelector.getIsRefresh)
            .pipe(distinctUntilChanged(), takeUntil(this._unSubscribe$))
            .subscribe((isRefresh) => {
                if (isRefresh) {
                    this.loadData(true);
                }
            });

        this.loadData(true);
    }

    loadData(refresh?: boolean): void {
        const paginator: any = this.paginator || {};

        const data: IQueryParams = {
            limit: paginator.pageSize || 5,
            skip: paginator.pageSize * paginator.pageIndex || 0,
            search: [],
        };

        const keyword = this.domSanitizer.sanitize(SecurityContext.HTML, this._searchKeyword.value).trim();

        if (keyword) {
            data.search.push({
                fieldName: 'keyword',
                keyword: keyword,
            });
        }

        if (this.$pageState.getTab()) {
            data.search.push({
                fieldName: 'status',
                keyword: this.$pageState.getTab(),
            });
        }

        if (this.$pageState.getStartDate()) {
            data.search.push({
                fieldName: 'startReturnDate',
                keyword: this.$pageState.getStartDate(),
            });
        }

        if (this.$pageState.getEndDate()) {
            data.search.push({
                fieldName: 'endReturnDate',
                keyword: this.$pageState.getEndDate(),
            });
        }

        if (data.search.length === 0) {
            delete data.search;
        }

        this.store.dispatch(ReturnActions.fetchReturnRequest({ payload: data }));

        if (refresh) {
            this.paginator.pageIndex = 0;

            this.store.dispatch(ReturnActions.fetchTotalReturnRequest());
            this.totalDataSource$ = this.store.select(ReturnsSelector.getTotalReturn);

            this.totalStatus$ = this.store.select(ReturnsSelector.getTotalStatus);
        }

        this.dataSource$ = this.store.select(ReturnsSelector.getAllReturn);
        this.isLoading$ = this.store.select(ReturnsSelector.getIsLoading);
    }

    onTrackBy(index: number, item: IReturnLine | null): string | number {
        return !item ? null : item.id;
    }

    onTabSelected(index: number): void {
        const statusMap = {
            0: null,
            1: 'pending',
            2: 'approved',
            3: 'approved_returned',
            4: 'closed',
            5: 'rejected',
        };

        this.$pageState.setTab(null);

        if (statusMap[index]) {
            this.$pageState.setTab(statusMap[index]);
        }

        this.loadData(true);
    }

    changeReturnStatus(status: string, row: IReturnLine|null): void {
        const { id = null, returnNumber = null } = row || {};

        if (id && returnNumber) {
            this.store.dispatch(ReturnActions.confirmChangeStatusReturn({
                payload: { id, status, returnNumber }
            }));
        }
    }

    ngOnDestroy(): void {
        if (this.store) {
            this.store.dispatch(UiActions.resetBreadcrumb());
            this.store.dispatch(UiActions.hideCustomToolbar());
            this.store.dispatch(ReturnActions.resetReturn());

            delete this.store;
        }

        if (this.sinbadFilterService) {
            this.sinbadFilterService.resetConfig();

            delete this.sinbadFilterService;
        }

        if (this._unSubscribe$) {
            this._unSubscribe$.next();
            this._unSubscribe$.complete();

            delete this._unSubscribe$;
        }
    }
}
