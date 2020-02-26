import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
    ViewChild
} from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { environment } from 'environments/environment';
import { MatPaginator, MatSort } from '@angular/material';

@Component({
    selector: 'app-stock-management-detail-history',
    templateUrl: './stock-management-detail-history.component.html',
    styleUrls: ['./stock-management-detail-history.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockManagementDetailHistoryComponent implements OnInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    displayedColumns = ['date', 'sku-id', 'sku-name', 'value-add', 'value-subtraction', 'reason'];

    dataSource = [
        {
            date: '15/01/2020',
            skuId: '82716127',
            skuName: 'LAKME CLASSIC EYEBROW PENCIL Brown',
            valueAdd: '1',
            valueSub: '-',
            reason: 'Inbound'
        },
        {
            date: '15/01/2020',
            skuId: '82716121',
            skuName: 'LAKME CLASSIC EYEBROW PENCIL Red',
            valueAdd: '-',
            valueSub: '1',
            reason: 'Outbound'
        },
        {
            date: '15/01/2020',
            skuId: '82716122',
            skuName: 'LAKME CLASSIC EYEBROW PENCIL White',
            valueAdd: '-',
            valueSub: '1',
            reason: 'Broken'
        },
        {
            date: '15/01/2020',
            skuId: '82716121',
            skuName: 'LAKME CLASSIC EYEBROW PENCIL Blue',
            valueAdd: '1',
            valueSub: '-',
            reason: 'Inbound'
        },
        {
            date: '15/01/2020',
            skuId: '82716121',
            skuName: 'LAKME CLASSIC EYEBROW PENCIL Blue',
            valueAdd: '1',
            valueSub: '-',
            reason: 'Inbound'
        }
    ];

    // CardHeader config
    cardHeaderConfig: ICardHeaderConfiguration = {
        class: 'm-0 mt-4 mb-16',
        title: {
            label: 'History'
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
            permissions: ['OMS.EXPORT']
        },
        import: {
            permissions: ['OMS.IMPORT'],
            useAdvanced: true,
            pageType: ''
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
    }
}
