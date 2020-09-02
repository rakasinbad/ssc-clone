import { animate, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
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
import { Portfolio } from '../../models';
import { IQueryParams } from 'app/shared/models/query.model';
import { environment } from 'environments/environment';
import { NgxPermissionsService } from 'ngx-permissions';
import { merge, Observable, Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PortfolioActions } from '../../store/actions';
import { FeatureState as AssociationCoreFeatureState } from '../../store/reducers';
import { PortfolioSelectors } from '../../store/selectors';
import { AssociationService, AssociationTab, AssociationViewBy } from '../../services';
import { HelperService } from 'app/shared/helpers';

@Component({
    selector: 'associations-view-by-portfolio',
    templateUrl: './view-by-portfolio.component.html',
    styleUrls: ['./view-by-portfolio.component.scss'],
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
export class AssociationViewByPortfolioComponent implements OnInit, OnDestroy, AfterViewInit {
    private subs$: Subject<void> = new Subject<void>();
    
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    displayedColumns = [
        // 'checkbox',
        'portfolio-code',
        'portfolio-name',
        'store-qty',
        'sales-target',
        'sales-rep'
        // 'actions'
    ];

    dataSource$: Observable<Array<Portfolio>>;
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
        private store: Store<AssociationCoreFeatureState>,
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

        if (selectedViewBy !== 'portfolio') {
            return;
        }

        if (selectedTab === 'all') {
            // Do nothing.
        } else if (selectedTab === 'portfolio-assigned-to-sr') {
            params['type'] = 'group';
            params['associated'] = true;
        } else if (selectedTab === 'sales-rep-without-assignment') {
            params['associated'] = false;
        }

        this.requestData(params);
    }

    private initSubscriptions(): void {
        // Data Source
        this.dataSource$ = this.store.select(
            PortfolioSelectors.selectAll
        ).pipe(
            tap(value => HelperService.debug('[SALES FORCE / SR ASSIGNMENT / PORTFOLIO] GET ALL PORTFOLIOS', value)),
            takeUntil(this.subs$)
        );

        // Loading State
        this.isLoading$ = this.store.select(
            PortfolioSelectors.getLoadingState
        ).pipe(
            tap(value => HelperService.debug('[SALES FORCE / SR ASSIGNMENT / PORTFOLIO] GET LOADING STATE', value)),
            takeUntil(this.subs$)
        );

        // Total Data Source
        this.totalDataSource$ = this.store.select(
            PortfolioSelectors.getTotalItem
        ).pipe(
            tap(value => HelperService.debug('[SALES FORCE / SR ASSIGNMENT / PORTFOLIO] GET TOTAL PORTFOLIOS AT BACK-END', value)),
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

                this.store.dispatch(PortfolioActions.clearState());
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
        this.store.dispatch(PortfolioActions.fetchPortfoliosRequest({ payload: params }));
    }

    /**
     * PUBLIC FUNCTIONS
     */

    onChangePage($event: PageEvent): void {}

    onSelectedTab(idx: number): void {
        if (idx === 0) {
            this.associationService.selectTab('all');
        } else if (idx === 1) {
            this.associationService.selectTab('portfolio-assigned-to-sr');
        } else if (idx === 2) {
            this.associationService.selectTab('portfolio-not-assigned-to-sr');
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        this.updatePrivileges();
    }

    ngAfterViewInit(): void {
        this.initSubscriptions();
    }

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        // Reset core state sales reps
        this.store.dispatch(PortfolioActions.clearState());

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
                        'portfolio-code',
                        'portfolio-name',
                        'store-qty',
                        'sales-target',
                        'sales-rep'
                        // 'actions'
                    ];
                } else {
                    this.displayedColumns = [
                        // 'checkbox',
                        'portfolio-code',
                        'portfolio-name',
                        'store-qty',
                        'sales-target',
                        'sales-rep'
                        // 'actions'
                    ];
                }
            });
    }
}
