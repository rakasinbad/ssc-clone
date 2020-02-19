import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';

@Component({
    selector: 'app-warehouse-detail-coverage',
    templateUrl: './warehouse-detail-coverage.component.html',
    styleUrls: ['./warehouse-detail-coverage.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseDetailCoverageComponent implements OnInit {
    // CardHeader config
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Warehouse Coverage Information'
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
