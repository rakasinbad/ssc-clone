import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { environment } from 'environments/environment';
import { merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CatalogueSegmentationDataSource } from '../../datasources';

@Component({
    selector: 'app-catalogue-segmentation-list',
    templateUrl: './catalogue-segmentation-list.component.html',
    styleUrls: ['./catalogue-segmentation-list.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueSegmentationListComponent implements OnInit, AfterViewInit, OnDestroy {
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

    @Input()
    keyword: string;

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    constructor() {}

    ngOnInit() {
        this.dataSource = new CatalogueSegmentationDataSource();

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

    private _initTable(): void {
        this.dataSource.getAll();
    }
}
