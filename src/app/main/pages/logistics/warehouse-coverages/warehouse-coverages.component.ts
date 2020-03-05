import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    ChangeDetectorRef,
    OnDestroy
} from '@angular/core';
import { MatPaginator, MatSort, MatRadioChange } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { UiSelectors } from 'app/shared/store/selectors';
import { ICardHeaderConfiguration } from 'app/shared/components/card-header/models';
import { UiActions, WarehouseActions } from 'app/shared/store/actions';
import { environment } from 'environments/environment';

import * as fromWarehouseCoverages from './store/reducers';
import { tap, takeUntil } from 'rxjs/operators';
import { Warehouse } from '../warehouses/models';
import { SelectedLocation } from 'app/shared/components/geolocation/models/selected-location.model';
import { WarehouseSelectors } from 'app/shared/store/selectors/sources';
import { IBreadcrumbs } from 'app/shared/models/global.model';
import { IQueryParams } from 'app/shared/models/query.model';

@Component({
    selector: 'app-warehouse-coverages',
    templateUrl: './warehouse-coverages.component.html',
    styleUrls: ['./warehouse-coverages.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseCoveragesComponent implements OnInit, OnDestroy {
    readonly defaultPageSize = environment.pageSize;
    readonly defaultPageOpts = environment.pageSizeTable;

    // tslint:disable-next-line: no-inferrable-types
    isFilterApplied: boolean = false;

    warehouses$: Observable<Array<Warehouse>>;
    selectedWarehouse: Warehouse;
    selectedLocation: SelectedLocation;
// 
    // tslint:disable-next-line: no-inferrable-types
    selectedViewBy: string = 'warehouse';

    // buttonViewByActive$: Observable<string>;
    subs$: Subject<void> = new Subject<void>();

    // CardHeader config
    cardHeaderConfig: ICardHeaderConfiguration = {
        title: {
            label: 'Warehouse Coverage'
        },
        search: {
            active: false
        },
        add: {
            permissions: []
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
        private cdRef: ChangeDetectorRef,
        private router: Router,
        private store: Store<fromWarehouseCoverages.FeatureState>
    ) {
        this.warehouses$ = this.store.select(
            WarehouseSelectors.selectAll
        ).pipe(
            tap(warehouses => {
                const newQuery: IQueryParams = {
                    paginate: false,
                };
                
                if (warehouses.length === 0) {
                    this.store.dispatch(
                        WarehouseActions.fetchWarehouseRequest({
                            payload: newQuery
                        })
                    );
                }
            }),
            takeUntil(this.subs$)
        );
    }

    private debug(label: string, data: any = {}): void {
        if (!environment.production) {
            // tslint:disable-next-line:no-console
            console.groupCollapsed(label, data);
            // tslint:disable-next-line:no-console
            console.trace(label, data);
            // tslint:disable-next-line:no-console
            console.groupEnd();
        }
    }

    onApplyFilter(): void {
        if (this.selectedViewBy === 'warehouse') {
            this.isFilterApplied = true;
        } else if (this.selectedViewBy === 'area') {
            this.isFilterApplied = true;
        }
    }

    onOpenWarehouseDetail(id: string): void {
        this.router.navigate(['/pages/logistics/warehouses/' + id + '/detail']);
    }

    ngOnInit(): void {
        // Set breadcrumbs
        this.store.dispatch(
            UiActions.createBreadcrumb({
                payload: this._breadCrumbs
            })
        );
    }

    ngOnDestroy(): void {
        this.subs$.next();
        this.subs$.complete();
    }

    onSelectedLocation($event: SelectedLocation): void {
        this.debug('onSelectedLocation', $event);

        if ($event.province && $event.city && $event.district && $event.urban) {
            this.isFilterApplied = false;
            this.selectedLocation = $event;
        } else {
            this.isFilterApplied = true;
            this.selectedLocation = null;
        }

        this.cdRef.markForCheck();
    }

    onSelectedWarehouse(warehouse: Warehouse): void {
        this.selectedWarehouse = warehouse;
        this.isFilterApplied = false;
        this.cdRef.markForCheck();
    }
// 
    onChangedViewBy($event: MatRadioChange): void {
        this.selectedViewBy = $event.value;
        this.isFilterApplied = true;

        this.cdRef.markForCheck();
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
