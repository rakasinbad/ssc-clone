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
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { IBreadcrumbs } from 'app/shared/models/global.model';
import { UiActions } from 'app/shared/store/actions';
import { environment } from 'environments/environment';

import * as fromStockManagements from './store/reducers';

@Component({
    selector: 'app-stock-managements',
    templateUrl: './stock-managements.component.html',
    styleUrls: ['./stock-managements.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockManagementsComponent implements OnInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    // CardHeader config
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Stock Management'
        },
        search: {
            active: true
            // changed: (value: string) => {
            //     this.search.setValue(value);
            //     setTimeout(() => this._onRefreshTable(), 100);
            // }
        },
        add: {
            permissions: []
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
    displayedColumns = [
        'checkbox',
        'wh-id',
        'wh-name',
        'total-sku',
        'stock-sellable',
        'stock-on-hand',
        'last-action-date',
        'actions'
    ];
    dataSource = [
        {
            id: '1',
            code: 'WH001',
            name: 'DC Cibinong',
            invoice: 'Danone, Combine, Mars',
            total: 58
        },
        {
            id: '2',
            code: 'WH002',
            name: 'DC Pulogebang 1',
            invoice: 'Danone, Combine, Mars',
            total: 51
        },
        {
            id: '3',
            code: 'WH003',
            name: 'DC Pulogebang 2',
            invoice: 'Danone, Combine, Mars',
            total: 34
        },
        {
            id: '4',
            code: 'WH004',
            name: 'DC Cikampek',
            invoice: 'Danone, Combine, Mars',
            total: 100
        }
    ];

    @ViewChild(MatPaginator, { static: true })
    paginator: MatPaginator;

    @ViewChild(MatSort, { static: true })
    sort: MatSort;

    private readonly _breadCrumbs: Array<IBreadcrumbs> = [
        {
            title: 'Home'
        },
        {
            title: 'Warehouse'
        },
        {
            title: 'Stock Management'
        }
    ];

    constructor(private router: Router, private store: Store<fromStockManagements.FeatureState>) {}

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.paginator.pageSize = this.defaultPageSize;

        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: this._breadCrumbs
            })
        );
    }

    onClickAdd(): void {
        this.router.navigateByUrl('/pages/logistics/stock-managements/new');
    }
}
