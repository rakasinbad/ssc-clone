import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { CatalogueDataSource } from '../../datasources';

@Component({
    selector: 'app-catalogue-list',
    templateUrl: './catalogue-list.component.html',
    styleUrls: ['./catalogue-list.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogueListComponent implements OnInit, AfterViewInit, OnDestroy {
    private unSubs$: Subject<any> = new Subject();

    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    displayedColumns = ['catalogue-name', 'sku-id', 'supplier-id', 'type', 'status'];

    dataSource: CatalogueDataSource;

    @Input()
    keyword: string;

    constructor() {}

    ngOnInit(): void {
        this.dataSource = new CatalogueDataSource();
    }

    ngAfterViewInit(): void {
        /* this.sort.sortChange
            .pipe(takeUntil(this.unSubs$))
            .subscribe(() => (this.paginator.pageIndex = 0));

        merge(this.sort.sortChange, this.paginator.page)
            .pipe(takeUntil(this.unSubs$))
            .subscribe(() => {
                this.table.nativeElement.scrollTop = 0;
                this._initTable();
            }); */
    }

    ngOnDestroy(): void {
        this.unSubs$.next();
        this.unSubs$.complete();
    }

    private _initTable(): void {
        this.dataSource.getAll();
    }
}
