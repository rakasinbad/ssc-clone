import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { Console } from 'console';
import { Observable } from 'rxjs';
import { FinanceDetailBillingV1 } from '../../../../models';
import * as billingStatus from '../../../../store/reducers';
import { BillingDetailSelectors } from '../../../../store/selectors';

@Component({
    selector: 'app-collection-history-table',
    templateUrl: './collection-history-table.component.html',
    styleUrls: ['./collection-history-table.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class CollectionHistoryTableComponent implements OnInit {
    displayedColumnsCollectionHistory = [
        'finance-collection-code',
        'finance-billing-date',
        'finance-paid-amount',
        'finance-method-payment',
        'finance-sales-rep-name',
        'finance-collection-status',
        'finance-billing-status',
        'finance-reason',
        'finance-updatedby',
        'finance-action',
    ];

    constructor(private store: Store<billingStatus.FeatureState>, private route: ActivatedRoute) {}
    dataDetail$: Observable<FinanceDetailBillingV1>;
    isLoading$: Observable<boolean>;

    ngOnInit() {
        const { id } = this.route.snapshot.params;
        this.dataDetail$ = this.store.select(BillingDetailSelectors.getSelectedItem, id);
        this.isLoading$ = this.store.select(BillingDetailSelectors.getLoadingState);
    }

    numberFormat(num) {
        if (num) {
            return num
                .toFixed(2)
                .replace('.', ',')
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        }

        return '-';
    }
}
