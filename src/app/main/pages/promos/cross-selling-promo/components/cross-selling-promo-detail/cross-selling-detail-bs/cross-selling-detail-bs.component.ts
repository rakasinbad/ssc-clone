import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import { BenefitType } from 'app/shared/models/benefit-type.model';
import { ConditionBase } from 'app/shared/models/condition-base.model';
import { Observable, Subscription } from 'rxjs';

import { CrossSelling, IPromoCatalogue } from '../../../models';
import * as fromCrossSellingPromos from '../../../store/reducers';
import { CrossSellingPromoSelectors } from '../../../store/selectors';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

@Component({
  selector: 'app-cross-selling-detail-bs',
  templateUrl: './cross-selling-detail-bs.component.html',
  styleUrls: ['./cross-selling-detail-bs.component.scss']
})
export class CrossSellingDetailBsComponent implements OnInit {
    crossSellingPromo$: Observable<CrossSelling>;
    isLoading$: Observable<boolean>;

    benefitType = this._$helperService.benefitType();
    eBenefitType = BenefitType;
    public benefitSetting = [];
    public benefitSubs: Subscription;
    constructor(
        private store: Store<fromCrossSellingPromos.FeatureState>,
        private _$helperService: HelperService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        this.crossSellingPromo$ = this.store.select(CrossSellingPromoSelectors.getSelectedItem);
        this.benefitSubs = this.crossSellingPromo$.subscribe(val => {
            this.benefitSetting.push(val.promoBenefit);
        })
        this.isLoading$ = this.store.select(CrossSellingPromoSelectors.getIsLoading);
    }

    ngOnDestroy(): void {
        this.benefitSubs.unsubscribe();
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    // getConditions(value: IPromoCondition[]): IPromoCondition[] {
    //     if (value && value.length > 0) {
    //         return value;
    //     }

    //     return [];
    // }

    // isApplySameSku(sources: IPromoCatalogue[], benefitSku: string): boolean {
    //     if (!sources || !sources.length || sources.length > 1 || !benefitSku) {
    //         return false;
    //     }

    //     if (sources.length == 1) {
    //         const idx = sources.findIndex((source) => source.id === benefitSku);
    //         if (sources[0]['catalogue'].id == benefitSku ) {
    //             return true;
    //         } else {
    //             return false
    //         }
            
    //     }
    //     // return idx !== -1;
    // }

}
