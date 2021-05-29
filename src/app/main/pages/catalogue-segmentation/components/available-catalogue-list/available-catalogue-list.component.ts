import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FormMode } from 'app/shared/models';
import { HashTable2 } from 'app/shared/models/hashtable2.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { environment } from 'environments/environment';
import { combineLatest, merge, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { AvailableCatalogueDataSource } from '../../datasources';
import { AvailableCatalogue } from '../../models';
import { AvailableCatalogueFacadeService } from '../../services';

@Component({
    selector: 'app-available-catalogue-list',
    templateUrl: './available-catalogue-list.component.html',
    styleUrls: ['./available-catalogue-list.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvailableCatalogueListComponent
    implements OnChanges, OnInit, AfterViewInit, OnDestroy
{
    @Input()
    keyword: string;

    @Input()
    formMode: FormMode;

    @Input()
    segmentationId: string;

    // @Input()
    // clickSelectAllCatalogue: boolean;

    // @Output()
    // clickSelectAllCatalogueChange: EventEmitter<boolean> = new EventEmitter();

    // @Input()
    // clickResetSelection: boolean;

    // @Output()
    // clickResetSelectionChange: EventEmitter<boolean> = new EventEmitter();

    // @Input()
    // clickUnassignAllSelection: boolean;

    // @Output()
    // clickUnassignAllSelectionChange: EventEmitter<boolean> = new EventEmitter();

    @Output()
    changeCatalogue: EventEmitter<AvailableCatalogue[]> = new EventEmitter();

    // @Output()
    // showBatchActions: EventEmitter<{
    //     isShowBatchActions: boolean;
    //     totalItem: number;
    // }> = new EventEmitter();

    @Output()
    loading: EventEmitter<boolean> = new EventEmitter();

    @Output()
    totalSelectedChange: EventEmitter<number> = new EventEmitter();

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('headCheckbox', { static: false })
    headCheckbox: MatCheckbox;

    private collections: AvailableCatalogue[] = [];

    private unSubs$: Subject<any> = new Subject();

    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    displayedColumns = ['checkbox', 'catalogue-name', 'external-id', 'type'];

    dataSource: AvailableCatalogueDataSource;
    isLoading: boolean;
    totalItem: number;

    isHeadChecked: boolean = false;
    isHeadIndeterminate: boolean = false;
    selectedId: string;
    selectedCatalogue: HashTable2<AvailableCatalogue> = new HashTable2([], 'id');

    constructor(
        private readonly cdRef: ChangeDetectorRef,
        private readonly availableCatalogueFacade: AvailableCatalogueFacadeService
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        console.log('CHANGES POP UP', { changes });

        if (changes['keyword']) {
            if (!changes['keyword'].isFirstChange()) {
                this._initTable();
            }
        }
    }

    ngOnInit(): void {
        this.dataSource = new AvailableCatalogueDataSource(this.availableCatalogueFacade);

        this.dataSource
            .collections$()
            .pipe(takeUntil(this.unSubs$))
            .subscribe((item) => {
                this.collections = item;
                this._updateHeadCheckbox();
            });

        combineLatest([this.dataSource.isLoading$, this.dataSource.totalItem$])
            .pipe(
                map(([isLoading, totalItem]) => ({ isLoading, totalItem })),
                takeUntil(this.unSubs$)
            )
            .subscribe(({ isLoading, totalItem }) => {
                this.isLoading = (this.formMode !== 'add' && !this.segmentationId) || isLoading;
                this.loading.emit(this.isLoading);
                this.totalItem = totalItem;
                this.cdRef.detectChanges();
            });

        this.availableCatalogueFacade.isRefresh$
            .pipe(
                filter((isRefresh) => isRefresh),
                takeUntil(this.unSubs$)
            )
            .subscribe(() => {
                this._initTable();
                this._resetSelection();
                this.selectedId = null;
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
        this.unSubs$.next();
        this.unSubs$.complete();
    }

    onAllRowsSelected(ev: MatCheckboxChange): void {
        console.log('onAllRowsSelected', { ev });

        if (this.isHeadChecked) {
            this.selectedCatalogue.upsert(this.collections);
        } else {
            this.selectedCatalogue.remove(this.collections.map((item) => item.id));
        }

        this._updateHeadCheckbox();
    }

    onRowSelected(ev: MatCheckboxChange, item: AvailableCatalogue): void {
        this.selectedId = item.id || null;

        if (ev.checked) {
            this.selectedCatalogue.upsert(item);
        } else {
            this.selectedCatalogue.remove(item.id);
        }

        this._updateHeadCheckbox();
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
            } else {
                data['sort'] = 'desc';
                data['sortBy'] = 'updated_at';
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

            this.dataSource.getWithQuery(data, this.segmentationId);
        }
    }

    private _resetSelection(): void {
        this.selectedCatalogue.clear();
        this._updateHeadCheckbox();
    }

    private _updateHeadCheckbox(): void {
        const selectedIds = this.selectedCatalogue.toArray().map((item) => item.id);
        const collectionIds = this.collections.map((item) => item.id);
        const totalSelectedOnPage = collectionIds.filter((id) => selectedIds.includes(id)).length;

        this.changeCatalogue.emit(this.selectedCatalogue.toArray());

        if (!selectedIds.length) {
            this._updateTickHeadCheckbox(false, false, totalSelectedOnPage);
        } else if (selectedIds.length === collectionIds.length) {
            if (!totalSelectedOnPage) {
                this._updateTickHeadCheckbox(false, false, totalSelectedOnPage);
            } else {
                this._updateTickHeadCheckbox(true, false, totalSelectedOnPage);
            }
        } else {
            if (!totalSelectedOnPage) {
                this._updateTickHeadCheckbox(false, false, totalSelectedOnPage);
            } else if (totalSelectedOnPage === collectionIds.length) {
                this._updateTickHeadCheckbox(true, false, totalSelectedOnPage);
            } else {
                this._updateTickHeadCheckbox(false, true, totalSelectedOnPage);
            }
        }
    }

    private _updateTickHeadCheckbox(
        checked: boolean,
        indeterminate: boolean,
        totalSelectedOnPage?: number
    ): void {
        this.isHeadChecked = checked;
        this.isHeadIndeterminate = indeterminate;
        this.totalSelectedChange.emit(totalSelectedOnPage);
    }
}
