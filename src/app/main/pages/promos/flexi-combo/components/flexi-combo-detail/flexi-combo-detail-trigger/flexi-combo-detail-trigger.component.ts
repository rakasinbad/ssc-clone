import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import { TriggerBase } from 'app/shared/models/trigger-base.model';
import { Observable } from 'rxjs';

import { FlexiCombo, IPromoBrand, IPromoCatalogue, IPromoInvoiceGroup } from '../../../models';
import * as fromFlexiCombos from '../../../store/reducers';
import { FlexiComboSelectors } from '../../../store/selectors';

@Component({
    selector: 'app-flexi-combo-detail-trigger',
    templateUrl: './flexi-combo-detail-trigger.component.html',
    styleUrls: ['./flexi-combo-detail-trigger.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlexiComboDetailTriggerComponent implements OnInit {
    flexiCombo$: Observable<FlexiCombo>;
    isLoading$: Observable<boolean>;

    triggerBase = this._$helperService.triggerBase();
    eTriggerBase = TriggerBase;

    constructor(
        private store: Store<fromFlexiCombos.FeatureState>,
        private _$helperService: HelperService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.flexiCombo$ = this.store.select(FlexiComboSelectors.getSelectedItem);
        this.isLoading$ = this.store.select(FlexiComboSelectors.getIsLoading);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getBrands(value: IPromoBrand[]): string {
        if (value && value.length > 0) {
            const brand = value.map((v) => v.brand.name);

            return brand.length > 0 ? brand.join(', ') : '-';
        }

        return '-';
    }

    getInvoiceGroups(value: IPromoInvoiceGroup[]): string {
        if (value && value.length > 0) {
            const invoice = value.map((v) => v.invoiceGroup.name);

            return invoice.length > 0 ? invoice.join(', ') : '-';
        }

        return '-';
    }

    getSkus(value: IPromoCatalogue[]): string {
        if (value && value.length > 0) {
            const sku = value.map((v) => v.catalogue.name);

            return sku.length > 0 ? sku.join(', ') : '-';
        }

        return '-';
    }
}
