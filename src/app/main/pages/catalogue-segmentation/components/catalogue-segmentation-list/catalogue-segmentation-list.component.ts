import { FeatureState } from './../../../../../shared/components/import-advanced/store/reducers/import-advanced.reducer';
import { Store, select } from '@ngrx/store';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { IBreadcrumbs } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { environment } from 'environments/environment';
import { combineLatest, merge, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { CatalogueSegmentationDataSource } from '../../datasources';
import { CatalogueSegmentation } from '../../models';
import { CatalogueSegmentationFacadeService } from '../../services';
import { CatalogueSegmentationActions } from '../../store/actions';
import { selectAll } from '../../store/selectors/catalogue-segmentation.selector';
import { fromCatalogueSegmentation } from '../../store/reducers';

@Component({
    selector: 'app-catalogue-segmentation-list',
    templateUrl: './catalogue-segmentation-list.component.html',
    styleUrls: ['./catalogue-segmentation-list.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueSegmentationListComponent
    implements OnChanges, OnInit, AfterViewInit, OnDestroy {
    private breadcrumbs: IBreadcrumbs[] = [
        {
            title: 'Home',
        },
        {
            title: 'Catalogue',
        },
        {
            title: 'Catalogue Segmentation',
            active: true,
        },
    ];
    private unSubs$: Subject<any> = new Subject();

    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    displayedColumns = [
        'segmentation-name',
        'warehouse-name',
        'store-type',
        'store-group',
        'store-channel',
        'store-cluster',
        'status',
        'actions',
    ];

    dataSource: CatalogueSegmentationDataSource;
    isLoading: boolean;
    totalItem: number;
    haha: any;

    @Input()
    keyword: string;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    constructor(
        private cdRef: ChangeDetectorRef,
        private catalogueSegmentationFacade: CatalogueSegmentationFacadeService,
        private store: Store<fromCatalogueSegmentation.FeatureState>,
    ) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['keyword']) {
            if (!changes['keyword'].isFirstChange()) {
                this._initTable();
            }
        }
    }

    ngOnInit(): void {
        this.catalogueSegmentationFacade.isRefresh$.subscribe(data => {
            if (data) {
                this._initTable();
                this.catalogueSegmentationFacade.isRefresh(false); //set isRefresh state to false
            }
        });

        this.catalogueSegmentationFacade.createBreadcrumb(this.breadcrumbs);

        this.dataSource = new CatalogueSegmentationDataSource(this.catalogueSegmentationFacade);

        combineLatest([this.dataSource.isLoading$, this.dataSource.totalItem$])
            .pipe(
                map(([isLoading, totalItem]) => ({ isLoading, totalItem })),
                takeUntil(this.unSubs$)
            )
            .subscribe(({ isLoading, totalItem }) => {
                this.isLoading = isLoading;
                this.totalItem = totalItem;
                this.cdRef.detectChanges();
            });

        this._initTable();
    }

    ngAfterViewInit(): void {
        this.sort.sortChange
            .pipe(takeUntil(this.unSubs$))
            .subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(takeUntil(this.unSubs$))
            .subscribe(() => {
                this.table.nativeElement.scrollTop = 0;
                this._initTable();
            });
    }

    ngOnDestroy(): void {
        this.catalogueSegmentationFacade.clearBreadcrumb();

        this.unSubs$.next();
        this.unSubs$.complete();
    }

    onTrackCatalogueSegmentation(index: number, item: CatalogueSegmentation): string {
        if (!item) {
            return null;
        }

        return item.id;
    }

    onDeleteCatalogueSegmentation(idCatalogueSegment: number): void {
        this.catalogueSegmentationFacade.delete(idCatalogueSegment);
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

            const query = this.keyword;

            if (query) {
                data['search'] = [
                    {
                        fieldName: 'keyword',
                        keyword: query,
                    },
                ];
            }

            this.dataSource.getWithQuery(data);
        }
    }
}
