import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { HelperService } from 'app/shared/helpers';
import { BenefitType, BenefitVoucherType } from 'app/shared/models/benefit-type.model';
import { ConditionBase, RatioBaseCondition } from 'app/shared/models/condition-base.model';
import { TriggerBase } from 'app/shared/models/trigger-base.model';
import { Observable, Subscription} from 'rxjs';
import { PromoHierarchy, PromoHierarchyDetail } from '../../../models';
import * as fromPromoHierarchy from '../../../store/reducers';
import { PromoHierarchySelectors } from '../../../store/selectors';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { PromoHierarchyApiService } from '../../../services/promo-hierarchy-api.service';

@Component({
    selector: 'app-promo-infomation',
    templateUrl: './promo-infomation.component.html',
    styleUrls: ['./promo-infomation.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromoInfomationComponent implements OnInit, OnDestroy {
    promoHierarchy$: Observable<PromoHierarchy>;
    isLoading$: Observable<boolean>;
;
    conditionBase = this._$helperService.conditionBase();
    eConditionBase = ConditionBase;
    benefitType = this._$helperService.benefitType();
    eBenefitType = BenefitType;
    benefitVoucherType = this._$helperService.benefitVoucherType();
    eBenefitVoucherType = BenefitVoucherType;
    triggerBase = this._$helperService.triggerBase();
    eTriggerBase = TriggerBase;

    public dataDetail: any;
    public subs: Subscription;
    dataGroup1: any;
    dataGroup2: any;
    promoDetail = [];

    constructor(
        private store: Store<fromPromoHierarchy.FeatureState>,
        private _$helperService: HelperService,
        private cdRef: ChangeDetectorRef,
    ) {
    }

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.
        this.promoHierarchy$ = this.store.select(PromoHierarchySelectors.getSelectedItem);
        console.log('isi promoHierarchy->', this.promoHierarchy$)
        // this.subs = this.promoHierarchy$.subscribe((val) => {
        //     console.log('isi val->', val)
        //     if (val != undefined) {
        //         this.promoDetail.push(val);
        //     }
        //     // this.promoDetail.push(val);
            
        // });
        // console.log('promodetail->', this.promoDetail)
        this.isLoading$ = this.store.select(PromoHierarchySelectors.getLoadingState);
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

    ngOnDestroy(): void {
        // this.subs.unsubscribe();
    }
}
