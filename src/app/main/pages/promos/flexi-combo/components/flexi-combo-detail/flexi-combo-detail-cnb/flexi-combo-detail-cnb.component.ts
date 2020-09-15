import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import { BenefitType } from 'app/shared/models/benefit-type.model';
import { ConditionBase, RatioBaseCondition } from 'app/shared/models/condition-base.model';
import { Observable } from 'rxjs';

import { FlexiCombo, IPromoCondition, IPromoCatalogue } from '../../../models';
import * as fromFlexiCombos from '../../../store/reducers';
import { FlexiComboSelectors } from '../../../store/selectors';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

@Component({
    selector: 'app-flexi-combo-detail-cnb',
    templateUrl: './flexi-combo-detail-cnb.component.html',
    styleUrls: ['./flexi-combo-detail-cnb.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlexiComboDetailCnbComponent implements OnInit {
    flexiCombo$: Observable<FlexiCombo>;
    isLoading$: Observable<boolean>;

    conditionBase = this._$helperService.conditionBase();
    eConditionBase = ConditionBase;
    benefitType = this._$helperService.benefitType();
    eBenefitType = BenefitType;

    ratioConditionBase = this._$helperService.buyRatioCondition();
    eBuyRatioCondition = RatioBaseCondition;

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

        this.flexiCombo$ = this.store.select(FlexiComboSelectors.getSelectedItem).pipe(
            map((item) => {
                if (item) {
                    const promoConditions =
                        item.promoConditions && item.promoConditions.length > 0
                            ? _.orderBy(item.promoConditions, ['id'], ['asc'])
                            : [];
                    return {
                        ...item,
                        promoConditions,
                    };
                }

                return item;
            })
        );
        this.isLoading$ = this.store.select(FlexiComboSelectors.getIsLoading);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getConditions(value: IPromoCondition[]): IPromoCondition[] {
        if (value && value.length > 0) {
            return value;
        }

        return [];
    }

    isApplySameSku(sources: IPromoCatalogue[], benefitSku: string): boolean {
        if (!sources || !sources.length || sources.length > 1 || !benefitSku) {
            return false;
        }

        if (sources.length == 1) {
            const idx = sources.findIndex((source) => source.id === benefitSku);
            if (sources[0]['catalogue'].id == benefitSku ) {
                return true;
            } else {
                return false
            }
            
        }
        // return idx !== -1;
    }
}
