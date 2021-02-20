import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import { BenefitType, BenefitVoucherType } from 'app/shared/models/benefit-type.model';
import { ConditionBase, RatioBaseCondition } from 'app/shared/models/condition-base.model';
import { TriggerBase } from 'app/shared/models/trigger-base.model';
import { Observable } from 'rxjs';
import { PromoHierarchy } from '../../../models';
import * as fromPromoHierarchy from '../../../store/reducers';
import { PromoHierarchySelectors } from '../../../store/selectors';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

@Component({
    selector: 'app-promo-infomation',
    templateUrl: './promo-infomation.component.html',
    styleUrls: ['./promo-infomation.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromoInfomationComponent implements OnInit {
    public dataDetail: any;
    dataGroup1: any;
    dataGroup2: any;
    flexiCombo$: Observable<PromoHierarchy>;
    isLoading$: Observable<boolean>;

    conditionBase = this._$helperService.conditionBase();
    eConditionBase = ConditionBase;
    benefitType = this._$helperService.benefitType();
    eBenefitType = BenefitType;
    benefitVoucherType = this._$helperService.benefitVoucherType();
    eBenefitVoucherType = BenefitVoucherType;
    triggerBase = this._$helperService.triggerBase();
    eTriggerBase = TriggerBase;

    constructor(
        private store: Store<fromPromoHierarchy.FeatureState>,
        private _$helperService: HelperService
    ) {}

    ngOnInit() {
        this.dataDetail = JSON.parse(localStorage.getItem('promo_hierarchy'));
        this.dataGroup1 = this.dataDetail.promoConditionCatalogues.filter(d => d.crossSellingGroup == 'Group 1');
        this.dataGroup2 = this.dataDetail.promoConditionCatalogues.filter(d => d.crossSellingGroup == 'Group 2');

    }

    getTriggerCatalogues(value: []): string {
        if (value && value.length > 0) {
            const triggerCatalogues = value.map((v) => v);

            return triggerCatalogues.length > 0 ? triggerCatalogues.join(', ') : '-';
        }

        return '-';
    }

    getSelectedWarehouse(value: []): string {
        if (value && value.length > 0) {
            const selectedWarehouse = value.map((v) => v);

            return selectedWarehouse.length > 0 ? selectedWarehouse.join(', ') : '-';
        }

        return '-';
    }

    getChoosenSku(value: []): string {
        if (value && value.length > 0) {
            const choosenSku = value.map((v) => v);

            return choosenSku.length > 0 ? choosenSku.join(', ') : '-';
        }

        return '-';
    }

    getBenefitSku(value: []): string {
        if (value && value.length > 0) {
            const benefitSku = value.map((v) => v);

            return benefitSku.length > 0 ? benefitSku.join(', ') : '-';
        }

        return '-';
    }
}
