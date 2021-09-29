import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormBuilder } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { UiActions } from 'app/shared/store/actions';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { SinbadFilterService } from 'app/shared/components/sinbad-filter/services';
import { returnsReducer } from './store/reducers';
import { ReturnsSelector } from './store/selectors';
import { IQueryParams } from '../../../shared/models/query.model';
import { ReturnActions } from './store/actions';
import { IReturnLine, ITotalReturnModel } from './models';

@Component({
    selector: 'app-returns',
    templateUrl: './returns.component.html',
    styleUrls: ['./returns.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
})
export class ReturnsComponent implements OnInit {

    dataSource$: Observable<any>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    totalStatus: {
        totalReturn$: Observable<number>;
        totalPending$: Observable<number>;
        totalApproved$: Observable<number>;
        totalApprovedReturned$: Observable<number>;
        totalClosed$: Observable<number>;
        totalRejected$: Observable<number>;
    };

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private _unSubscribe$: Subject<any> = new Subject<any>();

    readonly displayedColumns;

    readonly cardHeaderConfig: ICardHeaderConfiguration;

    constructor(
        private store: Store<returnsReducer.FeatureState>,

        private fuseSidebarService: FuseSidebarService,
        private sinbadFilterService: SinbadFilterService,
        private formBuilder: FormBuilder,
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
    }

    ngOnInit(): void {
        const form = this.formBuilder.group({
            startDate: null,
            endDate: null,
            minAmount: null,
            maxAmount: null,
            orderStatus: null,
            paymentStatus: null,
            warehouses: null,
            orderSource: null
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

        this.sinbadFilterService.setConfig({ ...filterConfig, form: form });

        this.sinbadFilterService
            .getClickAction$()
            .pipe(
                filter((action) => action === 'reset' || action === 'submit'),
                takeUntil(this._unSubscribe$)
            )
            .subscribe((action) => {
                if (action === 'reset') {
                    form.reset();
                } else {

                }

                this.loadData();
            });

        this.loadData();
    }

    loadData(): void {
        const paginator: any = this.paginator || {};

        const data: IQueryParams = {
            limit: paginator.pageSize || 5,
            skip: paginator.pageSize * paginator.pageIndex || 0,
        };

        this.store.dispatch(ReturnActions.fetchTotalReturnRequest());
        this.store.dispatch(ReturnActions.fetchReturnRequest({ payload: data }));

        this.dataSource$ = this.store.select(ReturnsSelector.getAllReturn);
        this.totalDataSource$ = this.store.select(ReturnsSelector.getTotalReturn);
        this.isLoading$ = this.store.select(ReturnsSelector.getIsLoading);

        this.totalStatus = {
            totalReturn$: this.store.select(ReturnsSelector.getTotalStatusReturn),
            totalPending$: this.store.select(ReturnsSelector.getTotalStatusPending),
            totalApproved$: this.store.select(ReturnsSelector.getTotalStatusApproved),
            totalApprovedReturned$: this.store.select(ReturnsSelector.getTotalStatusApprovedReturned),
            totalClosed$: this.store.select(ReturnsSelector.getTotalStatusClosed),
            totalRejected$: this.store.select(ReturnsSelector.getTotalStatusRejected),
        };
    }

    onTrackBy(index: number, item: IReturnLine | null): string | number {
        return !item ? null : item.id;
    }

    onTabSelected(index: number): void {

    }
}
