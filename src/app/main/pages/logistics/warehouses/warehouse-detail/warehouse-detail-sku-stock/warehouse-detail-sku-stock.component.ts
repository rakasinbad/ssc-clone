import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { environment } from 'environments/environment';

@Component({
    selector: 'app-warehouse-detail-sku-stock',
    templateUrl: './warehouse-detail-sku-stock.component.html',
    styleUrls: ['./warehouse-detail-sku-stock.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseDetailSkuStockComponent implements OnInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    displayedColumns = ['no', 'sku-id', 'sku-name', 'stock-type', 'sellable'];

    dataSource = [
        {
            id: '82716127',
            name: 'LAKME CLASSIC EYEBROW PENCIL BROWN',
            type: 'limited',
            sellable: '12'
        },
        {
            id: '82716121',
            name: 'LAKME CLASSIC EYEBROW PENCIL RED',
            type: 'limited',
            sellable: '57'
        },
        {
            id: '82716122',
            name: 'LAKME CLASSIC EYEBROW PENCIL WHITE',
            type: 'limited',
            sellable: '40'
        },
        {
            id: '82716123',
            name: 'LAKME CLASSIC EYEBROW PENCIL BLACK',
            type: 'unlimited',
            sellable: ''
        },
        {
            id: '82716124',
            name: 'LAKME CLASSIC EYEBROW PENCIL PINK',
            type: 'unlimited',
            sellable: ''
        }
    ];

    // CardHeader config
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'List SKU and Stock'
        },
        search: {
            active: true
            // changed: (value: string) => {
            //     this.search.setValue(value);
            //     setTimeout(() => this._onRefreshTable(), 100);
            // }
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

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    constructor() {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.paginator.pageSize = this.defaultPageSize;
    }

    generateNumber(idx: number): number {
        return this.paginator.pageIndex * this.paginator.pageSize + (idx + 1);
    }
}
