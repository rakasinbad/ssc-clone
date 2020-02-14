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
import { Store } from '@ngrx/store';
import { environment } from 'environments/environment';

import * as fromWarehouseCoverages from '../../store/reducers';

@Component({
    selector: 'app-warehouse-coverages-main',
    templateUrl: './warehouse-coverage-main.component.html',
    styleUrls: ['./warehouse-coverage-main.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseCoverageMainComponent implements OnInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    activeTab: string = 'all';

    displayedColumns = ['checkbox', 'wh-name', 'prov', 'city', 'district', 'urban', 'actions'];
    dataSource = [
        {
            id: '1',
            name: 'DC Cibinong',
            prov: 'DKI JAKARTA',
            city: 'JAKARTA SELATAN',
            district: 'Kalideres',
            urban: 'Pegadungan'
        },
        {
            id: '2',
            name: 'DC Cibinong',
            prov: 'DKI JAKARTA',
            city: 'JAKARTA SELATAN',
            district: 'Kalideres',
            urban: 'Pegadungan'
        },
        {
            id: '3',
            name: 'DC Cibinong',
            prov: 'DKI JAKARTA',
            city: 'JAKARTA SELATAN',
            district: 'Kalideres',
            urban: 'Pegadungan'
        },
        {
            id: '4',
            name: 'DC Cibinong',
            prov: 'DKI JAKARTA',
            city: 'JAKARTA SELATAN',
            district: 'Kalideres',
            urban: 'Pegadungan'
        }
    ];

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    constructor(
        private router: Router,
        private store: Store<fromWarehouseCoverages.FeatureState>
    ) {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.paginator.pageSize = this.defaultPageSize;
    }

    clickTab(action: 'all' | 'assigned-to-urban' | 'not-assigned-to-urban'): void {
        if (!action) {
            return;
        }

        switch (action) {
            case 'all':
                this.activeTab = 'all';
                break;
            case 'assigned-to-urban':
                this.activeTab = 'assigned-to-urban';
                break;
            case 'not-assigned-to-urban':
                this.activeTab = 'not-assigned-to-urban';
                break;

            default:
                return;
        }

        // this._initTable();
    }
}
