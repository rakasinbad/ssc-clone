import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { WarehouseInvoiceGroup } from 'app/shared/models';
import { Observable } from 'rxjs';

import { Warehouse } from '../../models';
import * as fromWarehouses from '../../store/reducers';
import { WarehouseSelectors } from '../../store/selectors';

@Component({
    selector: 'app-warehouse-detail-general',
    templateUrl: './warehouse-detail-general.component.html',
    styleUrls: ['./warehouse-detail-general.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseDetailGeneralComponent implements OnInit {
    warehouse$: Observable<Warehouse>;
    isLoading$: Observable<boolean>;

    constructor(private store: Store<fromWarehouses.FeatureState>) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.warehouse$ = this.store.select(WarehouseSelectors.getSelectedItem);
        this.isLoading$ = this.store.select(WarehouseSelectors.getIsLoading);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getInvoices(value: Array<WarehouseInvoiceGroup>): string {
        if (value && value.length > 0) {
            const invoiceGroup = value.map(v => v.invoiceGroup.name);

            return invoiceGroup.length > 0 ? invoiceGroup.join(', ') : '-';
        }

        return '-';
    }

    getLeadTime(day: number): string {
        return day > 1 ? `${day} Days` : `${day} Day`;
    }
}
