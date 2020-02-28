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
import { MatPaginator, MatSort } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { IQueryParams, LifecyclePlatform, WarehouseCoverage } from 'app/shared/models';
import { environment } from 'environments/environment';
import { merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

import { WarehouseCoverageActions } from '../../store/actions';
import * as fromWarehouses from '../../store/reducers';
import { WarehouseCoverageSelectors } from '../../store/selectors';

@Component({
    selector: 'app-warehouse-detail-coverage',
    templateUrl: './warehouse-detail-coverage.component.html',
    styleUrls: ['./warehouse-detail-coverage.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseDetailCoverageComponent implements OnInit, AfterViewInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    displayedColumns = ['province', 'city', 'district', 'urban'];

    // CardHeader config
    cardHeaderConfig: ICardHeaderConfiguration = {
        class: 'm-0 mt-4 mb-16',
        title: {
            label: 'Warehouse Coverage Information'
        },
        search: {
            active: true,
            changed: (value: string) => {
                this.search.setValue(value);
            }
        },
        add: {
            // permissions: []
        },
        export: {
            // permissions: ['OMS.EXPORT']
        },
        import: {
            // permissions: ['OMS.IMPORT'],
            // useAdvanced: true,
            // pageType: 'oms'
        }
    };

    search: FormControl = new FormControl('');
    dataSource$: Observable<Array<WarehouseCoverage>>;
    totalDataSource$: Observable<number>;
    isLoading$: Observable<boolean>;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private _unSubs$: Subject<void> = new Subject();

    constructor(
        private domSanitizer: DomSanitizer,
        private route: ActivatedRoute,
        private router: Router,
        private store: Store<fromWarehouses.FeatureState>
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
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

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
                // Reset core state warehouse coverages
                this.store.dispatch(WarehouseCoverageActions.clearState());

                this._unSubs$.next();
                this._unSubs$.complete();
                break;

            default:
                this.paginator.pageSize = this.defaultPageSize;

                this.dataSource$ = this.store.select(WarehouseCoverageSelectors.selectAll);
                this.totalDataSource$ = this.store.select(WarehouseCoverageSelectors.getTotalItem);
                this.isLoading$ = this.store.select(WarehouseCoverageSelectors.getIsLoading);

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

                this._initTable();
                break;
        }
    }

    private _initTable(): void {
        if (this.paginator) {
            const { id } = this.route.snapshot.params;

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
                data['search'] = [
                    {
                        fieldName: 'keyword',
                        keyword: query
                    }
                ];
            }

            this.store.dispatch(
                WarehouseCoverageActions.fetchWarehouseCoveragesRequest({
                    payload: { params: data, warehouseId: id }
                })
            );
        }
    }

    private _onRefreshTable(): void {
        this.paginator.pageIndex = 0;
        this._initTable();
    }
}
