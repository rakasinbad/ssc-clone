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
            id: '1',
            name: 'Warehouse 1',
            province: 'DKI Jakarta',
            city: 'Jakarta Selatan',
            district: 'Mampang',
            urban: 'Kuningan Barat'
        },
        {
            id: '2',
            name: 'Warehouse 1',
            province: 'DKI Jakarta',
            city: 'Jakarta Selatan',
            district: 'Mampang',
            urban: 'Pela Mampang'
        },
        {
            id: '3',
            name: 'Warehouse 1',
            province: 'DKI Jakarta',
            city: 'Jakarta Selatan',
            district: 'Mampang',
            urban: 'Bangka'
        },
        {
            id: '4',
            name: 'Warehouse 1',
            province: 'DKI Jakarta',
            city: 'Jakarta Selatan',
            district: 'Mampang',
            urban: 'Tegal Parang'
        },
        {
            id: '5',
            name: 'Warehouse 1',
            province: 'DKI Jakarta',
            city: 'Jakarta Selatan',
            district: 'Mampang',
            urban: 'Mampang Prapatan'
        }
    ];
    displayedColumns = ['wh-name', 'province', 'city', 'district', 'urban'];

    constructor() {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
    }
}
