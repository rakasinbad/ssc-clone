import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';

@Component({
    selector: 'app-stock-management-detail-general',
    templateUrl: './stock-management-detail-general.component.html',
    styleUrls: ['./stock-management-detail-general.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockManagementDetailGeneralComponent implements OnInit {
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
            permissions: ['OMS.EXPORT']
        },
        import: {
            permissions: ['OMS.IMPORT'],
            useAdvanced: true,
            pageType: ''
        }
    };
    dataSource = [
        {
            skuId: '82716127',
            skuName: 'LAKME CLASSIC EYEBROW PENCIL Brown',
            stockType: 'Limited',
            sellable: '12',
            onHand: '16'
        },
        {
            skuId: '82716127',
            skuName: 'LAKME CLASSIC EYEBROW PENCIL Red',
            stockType: 'Limited',
            sellable: '15',
            onHand: '98'
        },
        {
            skuId: '82716127',
            skuName: 'LAKME CLASSIC EYEBROW PENCIL Blue',
            stockType: 'Limited',
            sellable: '17',
            onHand: '78'
        },
        {
            skuId: '82716127',
            skuName: 'LAKME CLASSIC EYEBROW PENCIL Black',
            stockType: 'Limited',
            sellable: '32',
            onHand: '56'
        },
        {
            skuId: '82716127',
            skuName: 'LAKME CLASSIC EYEBROW PENCIL Green',
            stockType: 'Limited',
            sellable: '21',
            onHand: '25'
        },
        {
            skuId: '82716127',
            skuName: 'LAKME CLASSIC EYEBROW PENCIL Pink',
            stockType: 'Limited',
            sellable: '19',
            onHand: '24'
        }
    ];
    displayedColumns = ['sku-id', 'sku-name', 'stock-type', 'sellable', 'on-hand'];

    constructor() {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
    }
}
