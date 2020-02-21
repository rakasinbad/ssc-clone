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
    selector: 'app-sku-assignments-warehouse',
    templateUrl: './sku-assignment-warehouse.component.html',
    styleUrls: ['./sku-assignment-warehouse.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkuAssignmentWarehouseComponent implements OnInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    activeTab: string = 'all';

    displayedColumns = ['checkbox', 'wh-id', 'wh-name', 'total-sku', 'actions'];
    dataSource = [
        {
            id: '1',
            whId: 'WH0001',
            whName: 'DC CIBINONG',
            totalSku: '100'
        },
        {
            id: '2',
            whId: 'WH0002',
            whName: 'DC PULO GEBANG',
            totalSku: '100'
        },
        {
            id: '3',
            whId: 'WH0003',
            whName: 'DC TANGERANG',
            totalSku: '100'
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

    clickTab(action: 'all' | 'assigned-to-sku' | 'not-assigned-to-sku'): void {
        if (!action) {
            return;
        }

        switch (action) {
            case 'all':
                this.activeTab = 'all';
                break;
            case 'assigned-to-sku':
                this.activeTab = 'assigned-to-sku';
                break;
            case 'not-assigned-to-sku':
                this.activeTab = 'not-assigned-to-sku';
                break;

            default:
                return;
        }

        // this._initTable();
    }
}
