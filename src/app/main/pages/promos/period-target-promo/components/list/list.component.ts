import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    ElementRef,
    AfterViewInit,
    OnDestroy,
    Input,
    SimpleChanges,
    OnChanges
} from '@angular/core';
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { environment } from 'environments/environment';
import { PeriodTargetPromoActions } from '../../store/actions';
import { FormControl } from '@angular/forms';
import { Observable, Subject, merge } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxPermissionsService } from 'ngx-permissions';
import { takeUntil, flatMap } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { FeatureState as PeriodTargetPromoCoreState } from '../../store/reducers';
import { IQueryParams } from 'app/shared/models/query.model';
import { LifecyclePlatform } from 'app/shared/models/global.model';
import { PeriodTargetPromo } from '../../models';
import { PeriodTargetPromoSelectors } from '../../store/selectors';

type PromoStatus = 'all' | 'active' | 'inactive';
@Component({
    selector: 'period-target-promo-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    // host: {
    //     class: 'content-card mx-16 sinbad-black-10-border'
    // },
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class PeriodTargetPromoListComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    @Input() selectedStatus: PromoStatus = 'all';
    // tslint:disable-next-line: no-inferrable-types
    @Input() searchValue: string = '';

    search: FormControl = new FormControl();

    displayedColumns = [
        'checkbox',
        'promo-seller-id',
        'promo-name',
        'base',
        'start-date',
        'end-date',
        'status',
        'actions'
    ];

    selection: SelectionModel<PeriodTargetPromo>;

    dataSource$: Observable<Array<PeriodTargetPromo>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private subs$: Subject<void> = new Subject<void>();

    constructor(
        // private route: ActivatedRoute,
        // private router: Router,
        // private readonly sanitizer: DomSanitizer,
        private ngxPermissionsService: NgxPermissionsService,
        private PeriodTargetPromoStore: NgRxStore<PeriodTargetPromoCoreState>
    ) {}

    ngOnInit(): void {
        this.paginator.pageSize = this.defaultPageSize;
        this.selection = new SelectionModel<PeriodTargetPromo>(true, []);

        this.dataSource$ = this.PeriodTargetPromoStore.select(
            PeriodTargetPromoSelectors.getAllPeriodTargetPromo
        ).pipe(
            takeUntil(this.subs$)
        );

        this.totalDataSource$ = this.PeriodTargetPromoStore.select(
            PeriodTargetPromoSelectors.getPeriodTargetPromoTotalEntity
        ).pipe(takeUntil(this.subs$));

        this.isLoading$ = this.PeriodTargetPromoStore.select(PeriodTargetPromoSelectors.getLoadingState).pipe(
            takeUntil(this.subs$)
        );

        this._initTable();
        this.updatePrivileges();
    }

    // onSkuAssignmentDetail(row: SkuAssignmentsWarehouse): void {
    //     this.SkuAssignmentsStore.dispatch(
    //         SkuAssignmentsActions.selectWarehouse({
    //             payload: row as Warehouse
    //         })
    //     );

    //     this.router.navigate(['/pages/logistics/sku-assignments/' + row.id + '/detail']);
    // }

    // onEditSkuAssignment(item: Warehouse): void {
    //     this.SkuAssignmentsStore.dispatch(
    //         SkuAssignmentsActions.selectWarehouse({
    //             payload: item as Warehouse
    //         })
    //     );

    //     this.router.navigate(['/pages/logistics/sku-assignments/' + item.id + '/edit']);
    // }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['searchValue']) {
            this.search.setValue(changes['searchValue'].currentValue);
            setTimeout(() => this._initTable());
        }

        if (changes['selectedStatus']) {
            this.selectedStatus = changes['selectedStatus'].currentValue;
            setTimeout(() => this._initTable());
        }
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        this.sort.sortChange
            .pipe(takeUntil(this.subs$))
            .subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(takeUntil(this.subs$))
            .subscribe(() => {
                this._initTable();
            });
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
    }

    handleCheckbox(): void {
        this.isAllSelected()
            ? this.selection.clear()
            : this.dataSource$
                .pipe(
                    flatMap(v => v),
                    takeUntil(this.subs$)
                )
                .forEach(row => this.selection.select(row));
    }

    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.paginator.length;

        console.log('IS ALL SELECTED', numSelected, numRows);

        return numSelected === numRows;
    }

    private _initTable(): void {
        if (this.paginator) {
            const data: IQueryParams = {
                limit: this.paginator.pageSize || this.defaultPageSize,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0
            };

            data['paginate'] = true;
            data['keyword'] = this.search.value;

            if (this.selectedStatus !== 'all') {
                data['status'] = this.selectedStatus;
            }

            this.PeriodTargetPromoStore.dispatch(PeriodTargetPromoActions.resetPeriodTargetPromo());

            this.PeriodTargetPromoStore.dispatch(
                PeriodTargetPromoActions.fetchPeriodTargetPromoRequest({
                    payload: data
                })
            );
        }
    }

    private updatePrivileges(): void {
        this.ngxPermissionsService
            .hasPermission(['SRM.ASC.UPDATE', 'SRM.ASC.DELETE'])
            .then(result => {
                // Jika ada permission-nya.
                if (result) {
                    this.displayedColumns = [
                        'checkbox',
                        'promo-seller-id',
                        'promo-name',
                        'base',
                        'start-date',
                        'end-date',
                        'status',
                        'actions'
                    ];
                } else {
                    this.displayedColumns = [
                        'checkbox',
                        'promo-seller-id',
                        'promo-name',
                        'base',
                        'start-date',
                        'end-date',
                        'status',
                        'actions'
                    ];
                }
            });
    }
}
