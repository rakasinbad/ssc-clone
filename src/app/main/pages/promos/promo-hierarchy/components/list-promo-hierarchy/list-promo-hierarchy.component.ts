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
    SecurityContext,
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
import { IQueryParams } from 'app/shared/models/query.model';
import { DomSanitizer } from '@angular/platform-browser';
import { takeUntil, flatMap, filter } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { FeatureState as PromoHierarchyCoreState } from '../../store/reducers';
import { LifecyclePlatform } from 'app/shared/models/global.model';
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

    private _unSubs$: Subject<void> = new Subject<void>();

    constructor(
        private domSanitizer: DomSanitizer,
        private matDialog: MatDialog,
        private cdRef: ChangeDetectorRef,
        private router: Router,
        private PromoHierarchyStore: NgRxStore<PromoHierarchyCoreState>
    ) {}

    ngOnInit(): void {
        this.table.nativeElement.scrollTop = 0;
        this.paginator.pageIndex = 0;
        this._initTable();
        this.paginator.pageSize = this.defaultPageSize;
        this.selection = new SelectionModel<PromoHierarchy>(true, []);
        this._initPage();
    }

    ngAfterViewInit(): void {
        // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        // Add 'implements AfterViewInit' to the class.

        this._initPage(LifecyclePlatform.AfterViewInit);
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
        // Add '${implements OnChanges}' to the class.

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

    ngOnDestroy(): void {
        // Called once, before the instance is destroyed.
        // Add 'implements OnDestroy' to the class.

        this._initPage(LifecyclePlatform.OnDestroy);
    }

    onChangePage(ev: PageEvent): void {
        this.table.nativeElement.scrollIntoView();

        const data: IQueryParams = {
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
                group: value.promoOwner,
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

    openDetailPage(row: any): void {
        let itemPromoHierarchy = { type: row.promoType };
        localStorage.setItem('item', JSON.stringify(itemPromoHierarchy));
    }

    isAllSelected(): boolean {
        const numSelected = this.selection.selected.length;
        const numRows = this.paginator.length;

        HelperService.debug('IS ALL SELECTED', { numSelected, numRows });

        return numSelected === numRows;
    }

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
                break;

            case LifecyclePlatform.OnDestroy:
                // Reset core state CrossSellingPromoActions
                this.PromoHierarchyStore.dispatch(PromoHierarchyActions.clearState());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                this.paginator.pageSize = this.defaultPageSize;

                this.selection = new SelectionModel<any>(true, []);

                this.dataSource$ = this.PromoHierarchyStore.select(
                    PromoHierarchySelectors.selectAll
                );
                this.totalDataSource$ = this.PromoHierarchyStore.select(
                    PromoHierarchySelectors.getTotalItem
                );
                this.isLoading$ = this.PromoHierarchyStore.select(
                    PromoHierarchySelectors.getLoadingState
                );

                this._initTable();
                break;
        }
    }

    private _initTable(): void {
        if (this.paginator) {
            const data: IQueryParams = {
                limit: this.paginator.pageSize || this.defaultPageSize,
                skip: this.paginator.pageSize * this.paginator.pageIndex || 0,
            };

            data['paginate'] = true;

            if (this.sort.direction) {
                data['sort'] = this.sort.direction === 'desc' ? 'desc' : 'asc';
                data['sortBy'] = this.sort.active;
            }

            const query = this.domSanitizer.sanitize(SecurityContext.HTML, this.search.value);

            data['paginate'] = true;
            data['keyword'] = query;
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

            this.PromoHierarchyStore.dispatch(
                PromoHierarchyActions.fetchPromoHierarchyRequest({
                    payload: data,
                })
            );
        }
    }
}
