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
import { NgxPermissionsService } from 'ngx-permissions';
import { combineLatest, merge, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { CatalogueSegmentationDataSource } from '../../datasources';
import { CatalogueSegmentation, CatalogueSegmentationFilterDto } from '../../models';
import { CatalogueSegmentationFacadeService, CatalogueSegmentationService } from '../../services';

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

    @Input()
    keyword: string;

    @Input()
    globalFilter: CatalogueSegmentationFilterDto;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    constructor(
        private cdRef: ChangeDetectorRef,
        private catalogueSegmentationFacade: CatalogueSegmentationFacadeService,
        private catalogueSegmentationService: CatalogueSegmentationService,
        private ngxPermissions: NgxPermissionsService,
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['keyword']) {
            if (!changes['keyword'].isFirstChange()) {
                this._initTable();
            }
        }

        if (!changes['globalFilter'].isFirstChange()) {
            this.paginator.pageIndex = 0;
            this._initTable();
        }
    }

    ngOnInit(): void {
        this.catalogueSegmentationFacade.isRefresh$
            .pipe(takeUntil(this.unSubs$))
            .subscribe((data) => {
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

        const canDoActions = this.ngxPermissions.hasPermission([
            'CATALOGUE.UPDATE',
            'CATALOGUE.DELETE'
        ]);

        canDoActions.then(hasAccess => {
            if (hasAccess) {
                this.displayedColumns = [
                    'segmentation-name',
                    'warehouse-name',
                    'store-type',
                    'store-group',
                    'store-channel',
                    'store-cluster',
                    'status',
                    'actions',
                ];
            
            } else {
                this.displayedColumns = [
                    'segmentation-name',
                    'warehouse-name',
                    'store-type',
                    'store-group',
                    'store-channel',
                    'store-cluster',
                    'status'
                ];
            
            }
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

            data['search'] = this.catalogueSegmentationService.handleSearchGlobalFilter(
                data['search'],
                this.globalFilter
            );

            this.dataSource.getWithQuery(data);
        }
    }
}
