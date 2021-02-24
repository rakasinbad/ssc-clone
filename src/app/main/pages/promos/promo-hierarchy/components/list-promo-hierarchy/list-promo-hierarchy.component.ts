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
    OnChanges,
    ChangeDetectorRef,
} from '@angular/core';
import { MatPaginator, MatSort, PageEvent } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { environment } from 'environments/environment';
import { PromoHierarchyActions } from '../../store/actions';
import { FormControl } from '@angular/forms';
import { Observable, Subject, merge } from 'rxjs';
import { NgxPermissionsService } from 'ngx-permissions';
import { takeUntil, flatMap, filter } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { FeatureState as PromoHierarchyCoreState } from '../../store/reducers';
import { IQueryParamsVoucher } from 'app/shared/models/query.model';
// import { LifecyclePlatform } from 'app/shared/models/global.model';
import { PromoHierarchy } from '../../models';
import { PromoHierarchySelectors } from '../../store/selectors';
import { HelperService } from 'app/shared/helpers';
import { SetPromoHierarchyComponent } from '../../pages/set-promo-hierarchy/set-promo-hierarchy.component';

type PromoHierarchyType = 'layer0' | 'layer1' | 'layer2' | 'layer3' | 'layer4';

@Component({
    selector: 'app-list-promo-hierarchy',
    templateUrl: './list-promo-hierarchy.component.html',
    styleUrls: ['./list-promo-hierarchy.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class ListPromoHierarchyComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    @Input() selectedStatus: PromoHierarchyType = 'layer0';
    // tslint:disable-next-line: no-inferrable-types
    @Input() searchValue: string = '';
    @Input() viewByPromo: string = '';

    search: FormControl = new FormControl();

    displayedColumns = [
        'promo-seller-id',
        'promo-name',
        'promo-allocation',
        'allocation-value',
        'promo-type',
        'promo-group',
        'status',
        'actions',
    ];

    selection: SelectionModel<PromoHierarchy>;
    dataSource = [];
    totalDataSource: number;
    dataSource$: Observable<Array<PromoHierarchy>>;
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
        private matDialog: MatDialog,
        private cdRef: ChangeDetectorRef,
        private router: Router,
        private ngxPermissionsService: NgxPermissionsService,
        private PromoHierarchyStore: NgRxStore<PromoHierarchyCoreState>
    ) {}

    ngOnInit(): void {
        this.paginator.pageSize = this.defaultPageSize;
        this.selection = new SelectionModel<PromoHierarchy>(true, []);
        this.dataSource$ = this.PromoHierarchyStore.select(
            PromoHierarchySelectors.selectAll
        ).pipe(takeUntil(this.subs$));
        this.totalDataSource$ = this.PromoHierarchyStore.select(
            PromoHierarchySelectors.getTotalItem
        );

        this.isLoading$ = this.PromoHierarchyStore.select(
            PromoHierarchySelectors.getLoadingState
        ).pipe(takeUntil(this.subs$));

        this._initTable();

        this.cdRef.detectChanges();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['searchValue']) {
            if (!changes['searchValue'].isFirstChange()) {
                this.search.setValue(changes['searchValue'].currentValue);
                setTimeout(() => this._initTable());
            }
        }

        if (changes['selectedStatus']) {
            if (!changes['selectedStatus'].isFirstChange()) {
                this.selectedStatus = changes['selectedStatus'].currentValue;
                setTimeout(() => this._initTable());
            }
        }

        if (changes['viewByPromo']) {
            if (!changes['viewByPromo'].isFirstChange()) {
                this.viewByPromo = changes['viewByPromo'].currentValue;
                setTimeout(() => this._initTable());
            }
        }

        this.cdRef.detectChanges();
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

    onChangePage(ev: PageEvent): void {
        this.table.nativeElement.scrollIntoView();

        const data: IQueryParamsVoucher = {
            limit: this.paginator.pageSize,
            skip: this.paginator.pageSize * this.paginator.pageIndex,
        };

        if (this.sort.direction) {
            data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
        }

        this.table.nativeElement.scrollTop = 0;
    }

    settingPromoHierarchy(value) {
        const dialogRef = this.matDialog.open(SetPromoHierarchyComponent, {
            data: {
                id: value.promoSellerId,
                name: value.name,
                layer: value.layer,
                group: value.promoGroup,
                data: value,
            },
            disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'yes') {
                this._initTable();
            }
        });
    }

    openDetailPage(id: string, row: any): void {
        this.router.navigate([`/pages/promos/promo-hierarchy/view/${id}`]);
        localStorage.setItem('promo_hierarchy', JSON.stringify(row));
    }

    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.paginator.length;

        HelperService.debug('IS ALL SELECTED', { numSelected, numRows });

        return numSelected === numRows;
    }

    private _initTable(): void {
        if (this.paginator) {
            const data: IQueryParamsVoucher = {
                limit: this.paginator.pageSize || this.defaultPageSize,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
            };

            data['paginate'] = true;
            data['keyword'] = this.search.value;
            if (data['keyword'] !== null) {
                data['skip'] = 0;
            }
            data['type'] = this.viewByPromo;

            switch (this.selectedStatus) {
                case 'layer0':
                    data['layer'] = 0;
                    break;
                case 'layer1':
                    data['layer'] = 1;
                    break;
                case 'layer2':
                    data['layer'] = 2;
                    break;
                case 'layer3':
                    data['layer'] = 3;
                    break;
                case 'layer4':
                    data['layer'] = 4;
                    break;
            }

            this.PromoHierarchyStore.dispatch(PromoHierarchyActions.resetPromoHierarchy());
            this.PromoHierarchyStore.dispatch(
                PromoHierarchyActions.fetchPromoHierarchyRequest({
                    payload: data,
                })
            );

            this.cdRef.detectChanges();
        }
    }
}
