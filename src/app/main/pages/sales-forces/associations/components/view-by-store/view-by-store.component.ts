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
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { environment } from 'environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { merge, Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { StorePortfolio } from '../../models/';
import { StorePortfolioActions } from '../../store/actions';
import * as fromAssociationStores from '../../store/reducers';
import { StorePortfolioSelectors } from '../../store/selectors';
import { AssociationService, AssociationTab, AssociationViewBy } from '../../services';
import { HelperService } from 'app/shared/helpers';
import { IQueryParams } from 'app/shared/models/query.model';

@Component({
    selector: 'associations-view-by-store',
    templateUrl: './view-by-store.component.html',
    styleUrls: ['./view-by-store.component.scss'],
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
export class AssociationViewByStoreComponent implements OnInit, OnDestroy, AfterViewInit {
    private subs$: Subject<void> = new Subject<void>();

    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    // tslint:disable-next-line: no-inferrable-types
    activeTab: string = 'all';

    displayedColumns = [
        // 'checkbox',
        'store-code',
        'store-name',
        'owner-name',
        'owner-phone-number',
        'portfolio-code',
        'portfolio-name',
        'sales-rep',
        'date-associate'
        // 'actions'
    ];

    dataSource$: Observable<Array<StorePortfolio>>;
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
        private store: Store<fromAssociationStores.FeatureState>,
        private associationService: AssociationService,
        private ngxPermissionsService: NgxPermissionsService,
    ) {}

    /**
     * PRIVATE FUNCTIONS
     */

    private processParamsQuery(selectedTab: AssociationTab, selectedViewBy: AssociationViewBy): void {
        const params: IQueryParams = {
            limit: this.paginator.pageSize || 5,
            paginate: true,
            skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
        };

        if (selectedViewBy !== 'store') {
            return;
        }

        if (selectedTab === 'all') {
            params['portfolio'] = 'all';
        } else if (selectedTab === 'store-assigned-to-sr-in-portfolio') {
            params['portfolio'] = 'group';
            params['associated'] = true;
        } else if (selectedTab === 'store-assigned-to-sr-out-of-portfolio') {
            params['portfolio'] = 'direct';
            params['associated'] = true;
        } else if (selectedTab === 'store-not-assigned-to-sr-in-portfolio') {
            params['portfolio'] = 'group';
        } else if (selectedTab === 'store-not-assigned-to-sr-out-of-portfolio') {
            params['portfolio'] = 'direct';
        }

        this.requestData(params);
    }

    private initSubscriptions(): void {
        // Data Source
        this.dataSource$ = this.store.select(
            StorePortfolioSelectors.selectAll
        ).pipe(
            tap(value => HelperService.debug('[SALES FORCE / SR ASSIGNMENT / STORE] GET ALL STORE PORTFOLIOS', value)),
            takeUntil(this.subs$)
        );

        // Loading State
        this.isLoading$ = this.store.select(
            StorePortfolioSelectors.getLoadingState
        ).pipe(
            tap(value => HelperService.debug('[SALES FORCE / SR ASSIGNMENT / STORE] GET LOADING STATE', value)),
            takeUntil(this.subs$)
        );

        // Total Data Source
        this.totalDataSource$ = this.store.select(
            StorePortfolioSelectors.getTotalItem
        ).pipe(
            tap(value => HelperService.debug('[SALES FORCE / SR ASSIGNMENT / STORE] GET TOTAL STORE PORTFOLIOS AT BACK-END', value)),
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

                this.store.dispatch(StorePortfolioActions.clearState());
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
        this.store.dispatch(StorePortfolioActions.fetchStorePortfoliosRequest({ payload: params }));
    }

    /**
     * PUBLIC FUNCTIONS
     */

    onChangePage($event: PageEvent): void {}

    onSelectedTab(idx: number): void {
        if (idx === 0) {
            this.associationService.selectTab('all');
        } else if (idx === 1) {
            this.associationService.selectTab('store-assigned-to-sr-in-portfolio');
        } else if (idx === 2) {
            this.associationService.selectTab('store-assigned-to-sr-out-of-portfolio');
        } else if (idx === 3) {
            this.associationService.selectTab('store-not-assigned-to-sr-in-portfolio');
        } else if (idx === 4) {
            this.associationService.selectTab('store-not-assigned-to-sr-out-of-portfolio');
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

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
        this.store.dispatch(StorePortfolioActions.clearState());

        this.subs$.next();
        this.subs$.complete();

        this.trigger$.next();
        this.trigger$.complete();
    }

    private updatePrivileges(): void {
        this.ngxPermissionsService
            .hasPermission(['SRM.ASC.UPDATE', 'SRM.ASC.DELETE'])
            .then(result => {
                // Jika ada permission-nya.
                if (result) {
                    this.displayedColumns = [
                        // 'checkbox',
                        'store-code',
                        'store-name',
                        'owner-name',
                        'owner-phone-number',
                        'portfolio-code',
                        'portfolio-name',
                        'sales-rep',
                        'date-associate'
                        // 'actions'
                    ];
                } else {
                    this.displayedColumns = [
                        // 'checkbox',
                        'store-code',
                        'store-name',
                        'owner-name',
                        'owner-phone-number',
                        'portfolio-code',
                        'portfolio-name',
                        'sales-rep',
                        'date-associate'
                        // 'actions'
                    ];
                }
            });
    }
}
