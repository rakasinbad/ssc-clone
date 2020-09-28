import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import { TriggerBase } from 'app/shared/models/trigger-base.model';
import { ConditionBase } from 'app/shared/models/condition-base.model';
import { Observable } from 'rxjs';

import { CrossSelling, IPromoBrand, IPromoCatalogue, IPromoInvoiceGroup } from '../../../models';
import * as fromCrossSellingPromoCombos from '../../../store/reducers';
import { CrossSellingPromoSelectors } from '../../../store/selectors';

@Component({
  selector: 'app-cross-selling-detail-csg',
  templateUrl: './cross-selling-detail-csg.component.html',
  styleUrls: ['./cross-selling-detail-csg.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrossSellingDetailCsgComponent implements OnInit {
    crossSellingPromo$: Observable<CrossSelling>;
    isLoading$: Observable<boolean>;

    triggerBase = this._$helperService.triggerBase();
    eTriggerBase = TriggerBase;

    conditionBase = this._$helperService.conditionBase();
    eConditionBase = ConditionBase;
    constructor(
        private store: Store<fromCrossSellingPromoCombos.FeatureState>,
        private _$helperService: HelperService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.crossSellingPromo$ = this.store.select(CrossSellingPromoSelectors.getSelectedItem);
        this.isLoading$ = this.store.select(CrossSellingPromoSelectors.getIsLoading);
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
