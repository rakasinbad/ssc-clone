import { animate, style, transition, trigger } from '@angular/animations';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator, MatSort } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { Portfolio } from '../../models';
import { IQueryParams } from 'app/shared/models/query.model';
import { environment } from 'environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { merge, Observable, Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { AssociationActions, SalesRepActions } from '../../store/actions';
import * as fromAssociations from '../../store/reducers';
import { SalesRepSelectors } from '../../store/selectors';
import { AssociationService, AssociationTab, AssociationViewBy } from '../../services';
import { HelperService } from 'app/shared/helpers';
import { SalesRep } from '../../models';

@Component({
    selector: 'associations-view-by-sales-rep',
    templateUrl: './view-by-sales-rep.component.html',
    styleUrls: ['./view-by-sales-rep.component.scss'],
    // tslint:disable-next-line: no-host-metadata-property
    host: {
        class: 'content-card mx-16 sinbad-black-10-border'
    },
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
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssociationViewBySalesRepComponent implements OnInit, OnDestroy, AfterViewInit {
    private subs$: Subject<void> = new Subject<void>();

    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    displayedColumns = [
        // 'checkbox',
        'sales-rep-code',
        'sales-rep-name',
        'portfolio-code',
        'portfolio-name',
        // 'store-code',
        'store-qty',
        'sales-target',
        'date-associate'
        // 'actions'
    ];

    dataSource$: Observable<Array<SalesRep>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;
    trigger$: Subject<void> = new Subject<void>();

    lastSelectedTab: AssociationTab;
    lastSelectedViewBy: AssociationViewBy;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    constructor(
        private store: Store<fromAssociations.FeatureState>,
        private associationService: AssociationService,
        private ngxPermissionsService: NgxPermissionsService,
    ) {}

    private processParamsQuery(selectedTab: AssociationTab, selectedViewBy: AssociationViewBy): void {
        const params: IQueryParams = {
            limit: this.paginator.pageSize || 5,
            paginate: true,
            skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
        };

        if (selectedViewBy !== 'sales-rep') {
            return;
        }

        if (selectedTab === 'all') {
            params['type'] = 'all';
        } else if (selectedTab === 'sales-rep-with-assignment') {
            params['type'] = 'associated';
        } else if (selectedTab === 'sales-rep-without-assignment') {
            params['type'] = 'non-associated';
        }

        this.requestData(params);
    }

    private initSubscriptions(): void {
        // Data Source
        this.dataSource$ = this.store.select(
            SalesRepSelectors.selectAll
        ).pipe(
            tap(value => HelperService.debug('[SALES FORCE / SR ASSIGNMENT / SALES REP] GET ALL SALES REPS', value)),
            takeUntil(this.subs$)
        );

        // Loading State
        this.isLoading$ = this.store.select(
            SalesRepSelectors.getLoadingState
        ).pipe(
            tap(value => HelperService.debug('[SALES FORCE / SR ASSIGNMENT / SALES REP] GET LOADING STATE', value)),
            takeUntil(this.subs$)
        );

        // Total Data Source
        this.totalDataSource$ = this.store.select(
            SalesRepSelectors.getTotalItem
        ).pipe(
            tap(value => HelperService.debug('[SALES FORCE / SR ASSIGNMENT / SALES REP] GET TOTAL SALES REPS AT BACK-END', value)),
            takeUntil(this.subs$)
        );

        // Listener for changed tab and view by
        combineLatest([
            this.trigger$,
            this.associationService.getSelectedTab(),
            this.associationService.getSelectedViewBy(),
        ]).pipe(
            tap(([_, tab, viewBy]) => {
                if (tab !== this.lastSelectedTab || viewBy !== this.lastSelectedViewBy) {
                    this.paginator.pageIndex = 0;
                    this.lastSelectedTab = tab;
                    this.lastSelectedViewBy = viewBy;
                }

                this.store.dispatch(SalesRepActions.clearState());
            }),
            takeUntil(this.subs$)
        ).subscribe(([_, tab, viewBy]) => {
            this.processParamsQuery(tab, viewBy);
        });

        // Listener for pagination and sort changes.
        merge(
            this.sort.sortChange,
            this.paginator.page
        ).pipe(
            takeUntil(this.subs$)
        ).subscribe(() => {
            this.trigger$.next();
        });

        // Trigger for the initial request.
        setTimeout(() => this.trigger$.next(), 500);
    }

    private requestData(params: IQueryParams): void {
        this.store.dispatch(SalesRepActions.fetchSalesRepsRequest({ payload: params }));
    }

    onSelectedTab(idx: number): void {
        if (idx === 0) {
            this.associationService.selectTab('all');
        } else if (idx === 1) {
            this.associationService.selectTab('sales-rep-with-assignment');
        } else if (idx === 2) {
            this.associationService.selectTab('sales-rep-without-assignment');
        }
    }

    ngOnInit(): void {
        this.updatePrivileges();
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.
        this.initSubscriptions();
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        // Reset core state sales reps
        this.store.dispatch(AssociationActions.clearState());

        this.subs$.next();
        this.subs$.complete();

        this.trigger$.next();
        this.trigger$.complete();
    }

    generatePortfolioCode(portfolios: Array<Portfolio>): string {
        if (!portfolios || !Array.isArray(portfolios) || portfolios.length === 0) {
            return '-';
        }

        return portfolios.map(portfolio => portfolio.code).join(',<br/>');
    }

    generatePortfolioName(portfolios: Array<Portfolio>): string {
        if (!portfolios || !Array.isArray(portfolios) || portfolios.length === 0) {
            return '-';
        }

        return portfolios.map(portfolio => portfolio.name).join(',<br/>');
    }

    private updatePrivileges(): void {
        this.ngxPermissionsService
            .hasPermission(['SRM.ASC.UPDATE', 'SRM.ASC.DELETE'])
            .then(result => {
                // Jika ada permission-nya.
                if (result) {
                    this.displayedColumns = [
                        // 'checkbox',
                        'sales-rep-code',
                        'sales-rep-name',
                        'portfolio-code',
                        'portfolio-name',
                        // 'store-code',
                        'store-qty',
                        'sales-target',
                        'date-associate'
                        // 'actions'
                    ];
                } else {
                    this.displayedColumns = [
                        // 'checkbox',
                        'sales-rep-code',
                        'sales-rep-name',
                        'portfolio-code',
                        'portfolio-name',
                        // 'store-code',
                        'store-qty',
                        'sales-target',
                        'date-associate'
                        // 'actions'
                    ];
                }
            });
    }
}
