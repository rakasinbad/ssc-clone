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
    public benefits: any;
    public subs: Subscription;
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
        this.crossSellingPromo$ = this.store.select(CrossSellingPromoSelectors.getSelectedItem)
        .pipe(
            map((item) => {
                return item;
            })
        );
        this.subs = this.crossSellingPromo$.subscribe(val => {
            this.benefitSetting.push(val);
            this.benefits = this.benefitSetting[0].promoBenefit;
        });
        this.isLoading$ = this.store.select(CrossSellingPromoSelectors.getIsLoading);
    }

    ngOnDestroy(): void{
        this.subs.unsubscribe();
    }

}
