import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { HashTable2 } from 'app/shared/models/hashtable2.model';
import { environment } from 'environments/environment';
import { AvailableCatalogueDataSource } from '../../datasources';
import { AvailableCatalogue } from '../../models';

@Component({
    selector: 'app-available-catalogue-list',
    templateUrl: './available-catalogue-list.component.html',
    styleUrls: ['./available-catalogue-list.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvailableCatalogueListComponent implements OnInit {
    @Input()
    keyword: string;

    @Input()
    clickSelectAllCatalogue: boolean;

    @Output()
    clickSelectAllCatalogueChange: EventEmitter<boolean> = new EventEmitter();

    @Input()
    clickResetSelection: boolean;

    @Output()
    clickResetSelectionChange: EventEmitter<boolean> = new EventEmitter();

    @Input()
    clickUnassignAllSelection: boolean;

    @Output()
    clickUnassignAllSelectionChange: EventEmitter<boolean> = new EventEmitter();

    @Output()
    changeCatalogue: EventEmitter<AvailableCatalogue[] | 'all'> = new EventEmitter();

    @Output()
    showBatchActions: EventEmitter<{
        isShowBatchActions: boolean;
        totalItem: number;
    }> = new EventEmitter();

    @Output()
    loading: EventEmitter<boolean> = new EventEmitter();

    @ViewChild('table', { read: ElementRef, static: true })
    table: ElementRef;

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    @ViewChild('headCheckbox', { static: false })
    headCheckbox: MatCheckbox;

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

    testData: AvailableCatalogue[] = [];

    constructor() {}

    ngOnInit(): void {
        this.testData = [
            {
                id: '1',
                name: 'SKU 1',
                supplierId: '1',
                type: 'regular',
            },
            {
                id: '2',
                name: 'SKU 2',
                supplierId: '1',
                type: 'regular',
            },
            {
                id: '2',
                name: 'SKU 3',
                supplierId: '1',
                type: 'regular',
            },
        ].map((item) => new AvailableCatalogue(item));
    }
}
