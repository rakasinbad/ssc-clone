import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store as NgRxStore } from '@ngrx/store';
import { environment } from 'environments/environment';

import { fromSkuAssignments } from '../../store/reducers';

@Component({
    selector: 'app-sku-assignments-sku',
    templateUrl: './sku-assignment-sku.component.html',
    styleUrls: ['./sku-assignment-sku.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkuAssignmentSkuComponent implements OnInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    activeTab: string = 'all';

    displayedColumns = ['checkbox', 'sku-id', 'sku-name', 'brand', 'total-warehouse', 'actions'];
    dataSource = [
        {
            id: '1',
            skuId: '67128891',
            skuName: 'LAKME ABSOLUTE LIQUID CONCEALER ROSE FAIR',
            brand: 'Lakme',
            totalWarehouse: '10'
        },
        {
            id: '2',
            skuId: '67128891',
            skuName: 'LAKME ABSOLUTE LIQUID CONCEALER ROSE FAIR',
            brand: 'Lakme',
            totalWarehouse: '10'
        },
        {
            id: '3',
            skuId: '67128891',
            skuName: 'LAKME ABSOLUTE LIQUID CONCEALER ROSE FAIR',
            brand: 'Lakme',
            totalWarehouse: '10'
        },
        {
            id: '4',
            skuId: '67128891',
            skuName: 'LAKME ABSOLUTE LIQUID CONCEALER ROSE FAIR',
            brand: 'Lakme',
            totalWarehouse: '10'
        },
        {
            id: '5',
            skuId: '67128891',
            skuName: 'LAKME ABSOLUTE LIQUID CONCEALER ROSE FAIR',
            brand: 'Lakme',
            totalWarehouse: '10'
        }
    ];

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    constructor(
        private router: Router,
        private SkuAssignmentsStore: NgRxStore<fromSkuAssignments.SkuAssignmentsState>
    ) {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.paginator.pageSize = this.defaultPageSize;
    }

    clickTab(action: 'all' | 'assign-to-warehouse' | 'not-assign-to-warehouse'): void {
        if (!action) {
            return;
        }

        switch (action) {
            case 'all':
                this.activeTab = 'all';
                break;
            case 'assign-to-warehouse':
                this.activeTab = 'assign-to-warehouse';
                break;
            case 'not-assign-to-warehouse':
                this.activeTab = 'not-assign-to-warehouse';
                break;

            default:
                return;
        }

        // this._initTable();
    }
}
