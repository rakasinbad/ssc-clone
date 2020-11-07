import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatCheckbox, MatCheckboxChange, MatPaginator, MatSort } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FormMode } from 'app/shared/models';
import { HashTable2 } from 'app/shared/models/hashtable2.model';
import { IQueryParams } from 'app/shared/models/query.model';
import { environment } from 'environments/environment';
import { combineLatest, merge, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { CatalogueDataSource } from '../../datasources';
import { Catalogue } from '../../models';
import { CatalogueFacadeService } from '../../services';

@Component({
    selector: 'app-catalogue-list',
    templateUrl: './catalogue-list.component.html',
    styleUrls: ['./catalogue-list.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueListComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {
    private collections: Catalogue[] = [];
    private unSubs$: Subject<any> = new Subject();

    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    displayedColumns = ['checkbox', 'catalogue-name', 'sku-id', 'external-id', 'type', 'status'];

    dataSource: CatalogueDataSource;
    isLoading: boolean;
    totalItem: number;

    isHeadChecked: boolean = false;
    isHeadIndeterminate: boolean = false;
    selectedId: string;
    selectedCatalogue: HashTable2<Catalogue> = new HashTable2([], 'id');

    @Input()
    keyword: string;

    @Input()
    formMode: FormMode;

    @Input()
    segmentationId: string;

    @Input()
    clickSelectAllCatalogue: boolean;

    @Output()
    clickSelectAllCatalogueChange: EventEmitter<boolean> = new EventEmitter();

    @Output()
    changeCatalogue: EventEmitter<Catalogue[] | 'all'> = new EventEmitter();

    @Output()
    showBatchActions: EventEmitter<{
        isShowBatchActions: boolean;
        totalItem: number;
    }> = new EventEmitter();

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('headCheckbox', { static: false })
    headCheckbox: MatCheckbox;

    constructor(
        private cdRef: ChangeDetectorRef,
        private catalogueFacade: CatalogueFacadeService
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        console.log('CHANGES CATALOGUE LIST', { changes });

        if (changes['keyword']) {
            if (!changes['keyword'].isFirstChange()) {
                this._initTable();
            }
        }

        if (changes['clickSelectAllCatalogue']) {
            if (
                !changes['clickSelectAllCatalogue'].isFirstChange() &&
                changes['clickSelectAllCatalogue'].currentValue === true
            ) {
                this._updateChangeCatalogueToAll();
            }
        }

        if (changes['formMode']) {
            this._updateTableColumn(changes['formMode'].currentValue);
        }

        if (changes['segmentationId']) {
            if (
                !changes['segmentationId'].isFirstChange() &&
                changes['segmentationId'].currentValue
            ) {
                this._initTable();
            }
        }
    }

    ngOnInit(): void {
        this.dataSource = new CatalogueDataSource(this.catalogueFacade);

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
        this.unSubs$.next();
        this.unSubs$.complete();
    }

    onAllRowsSelected(ev: MatCheckboxChange): void {
        console.log('ALL ROWS', {
            ev,
            headCk: this.headCheckbox,
            isHeadChecked: this.isHeadChecked,
            isHeadIndeterminate: this.isHeadIndeterminate,
        });

        if (this.isHeadChecked) {
            this.selectedCatalogue.upsert(this.collections);
        } else {
            this.selectedCatalogue.remove(this.collections.map((item) => item.id));
        }

        this._updateHeadCheckbox();
    }

    onRowSelected(ev: MatCheckboxChange, item: Catalogue): void {
        console.log('ROW SELECTED', { ev, item, headCk: this.headCheckbox });

        this.selectedId = item.id || null;

        if (ev.checked) {
            this.selectedCatalogue.upsert(item);
        } else {
            this.selectedCatalogue.remove(item.id);
        }

        this._updateHeadCheckbox();
    }

    onTrackCatalogue(index: number, item: Catalogue): string {
        if (!item) {
            return null;
        }

        return item.id;
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

            if (this.formMode === 'add') {
                this.dataSource.getWithQuery(data);
            } else if (this.segmentationId) {
                this.dataSource.getWithQuery(data, this.formMode, this.segmentationId);
            }
        }
    }

    private _updateHeadCheckbox(): void {
        const selectedIds = this.selectedCatalogue.toArray().map((item) => item.id);
        const collectionIds = this.collections.map((item) => item.id);
        const totalSelectedOnPage = collectionIds.filter((id) => selectedIds.includes(id)).length;

        this.changeCatalogue.emit(this.selectedCatalogue.toArray());

        if (!selectedIds.length) {
            this._updateTickHeadCheckbox(false, false);
        } else if (selectedIds.length === collectionIds.length) {
            if (!totalSelectedOnPage) {
                this._updateTickHeadCheckbox(false, false);
            } else {
                this._updateTickHeadCheckbox(true, false);
            }
        } else {
            if (!totalSelectedOnPage) {
                this._updateTickHeadCheckbox(false, false);
            } else if (totalSelectedOnPage === collectionIds.length) {
                this._updateTickHeadCheckbox(true, false);
            } else {
                this._updateTickHeadCheckbox(false, true);
            }
        }

        console.log('UPDATE_HEAD_CHECKBOX', {
            collectionIds,
            totalSelectedOnPage,
            selected: this.selectedCatalogue,
            totalItem: this.totalItem,
            selectedIds,
            isHeadChecked: this.isHeadChecked,
            isHeadIndeterminate: this.isHeadIndeterminate,
        });
    }

    private _updateTickHeadCheckbox(checked: boolean, indeterminate: boolean): void {
        this.isHeadChecked = checked;
        this.isHeadIndeterminate = indeterminate;

        if (checked === true) {
            this._showBatchActions(true);
        } else {
            this._showBatchActions(false);
        }
    }

    private _showBatchActions(isShowBatchActions: boolean): void {
        this.showBatchActions.emit({ isShowBatchActions, totalItem: this.totalItem });
    }

    private _updateChangeCatalogueToAll(): void {
        this.changeCatalogue.emit('all');
        this.clickSelectAllCatalogueChange.emit(false);
    }

    private _updateTableColumn(formMode: FormMode): void {
        switch (formMode) {
            case 'view':
                this.displayedColumns = [
                    'catalogue-name',
                    'sku-id',
                    'external-id',
                    'type',
                    'status',
                ];
                break;

            default:
                break;
        }
    }
}
