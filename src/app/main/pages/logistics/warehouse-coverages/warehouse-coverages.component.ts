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
import { Observable } from 'rxjs';
import { UiSelectors } from 'app/shared/store/selectors';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { IBreadcrumbs } from 'app/shared/models';
import { UiActions } from 'app/shared/store/actions';
import { environment } from 'environments/environment';

import * as fromWarehouseCoverages from './store/reducers';
import { tap } from 'rxjs/operators';

@Component({
    selector: 'app-warehouse-coverages',
    templateUrl: './warehouse-coverages.component.html',
    styleUrls: ['./warehouse-coverages.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseCoveragesComponent implements OnInit {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    buttonViewByActive$: Observable<string>;

    // CardHeader config
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Warehouse Coverage'
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
        viewBy: {
            list: [
                { id: 'warehouse-coverage-main', label: 'Warehouse' },
                { id: 'warehouse-covearge-urban', label: 'Urban' }
            ],
            onChanged: (value: { id: string; label: string }) => this.clickTabViewBy(value.id)
        },
        export: {
            permissions: ['SRM.JP.EXPORT'],
            useAdvanced: true,
            pageType: 'journey-plans'
        },
        import: {
            permissions: ['SRM.JP.IMPORT'],
            useAdvanced: true,
            pageType: 'journey-plans'
        }
    };

    private readonly _breadCrumbs: Array<IBreadcrumbs> = [
        {
            title: 'Home'
        },
        {
            title: 'Logistics'
        },
        {
            title: 'Warehouse Coverage'
        }
    ];

    constructor(
        private router: Router,
        private store: Store<fromWarehouseCoverages.FeatureState>
    ) {}

    ngOnInit(): void {
        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: this._breadCrumbs
            })
        );
        this.buttonViewByActive$ = this.store.select(UiSelectors.getCustomToolbarActive);
    }

    onClickAdd(): void {
        this.router.navigateByUrl('/pages/logistics/warehouse-coverages/new');
    }

    clickTabViewBy(action: string): void {
        if (!action) {
            return;
        }

        switch (action) {
            case 'warehouse-coverage-main':
                this.store.dispatch(
                    UiActions.setCustomToolbarActive({ payload: 'warehouse-coverage-main' })
                );
                break;
            case 'warehouse-covearge-urban':
                this.store.dispatch(
                    UiActions.setCustomToolbarActive({ payload: 'warehouse-covearge-urban' })
                );
                break;

            default:
                return;
        }
    }
}
