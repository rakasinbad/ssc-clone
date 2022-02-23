import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { FinanceDetailBillingV1 } from '../../../../models/billing.model';
import * as billingStatus from '../../../../store/reducers';
import { BillingDetailSelectors } from '../../../../store/selectors';

@Component({
    selector: 'app-detail-billing-generalinfo',
    templateUrl: './detail-billing-generalinfo.component.html',
    styleUrls: ['./detail-billing-generalinfo.component.scss'],
})
export class DetailBillingGeneralinfoComponent implements OnInit, OnDestroy {
    dataDetail$: Observable<FinanceDetailBillingV1>;
    isLoading$: Observable<boolean>;
    private subs: Subscription = new Subscription();

    constructor(private store: Store<billingStatus.FeatureState>, private route: ActivatedRoute) {}

    ngOnInit() {
        const { id } = this.route.snapshot.params;

        this.dataDetail$ = this.store.select(BillingDetailSelectors.getSelectedItem, id);
        this.isLoading$ = this.store.select(BillingDetailSelectors.getLoadingState);
    }

    ngOnDestroy(): void {
        //unsubscribeAll
        this.subs.unsubscribe();
    }

    numberFormat(num) {
        if (num) {
            return 'Rp' + num
                .toFixed(2)
                .replace('.', ',')
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        }
        
        return '-';
    }
}
