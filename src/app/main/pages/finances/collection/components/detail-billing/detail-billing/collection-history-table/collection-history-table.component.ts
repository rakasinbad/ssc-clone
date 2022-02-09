import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { Console } from 'console';
import { Observable, Subscription } from 'rxjs';
import { FinanceDetailBillingV1 } from '../../../../models';
import * as billingStatus from '../../../../store/reducers';
import { BillingDetailSelectors } from '../../../../store/selectors';
import { ApproveRejectCollectionBillingComponent } from '../../../modal/approve-reject-collection-billing/approve-reject-collection-billing.component';

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

    constructor(
        private store: Store<billingStatus.FeatureState>,
        private route: ActivatedRoute,
        private dialog: MatDialog
    ) {}
    dataDetail$: Observable<FinanceDetailBillingV1>;
    dataDetail: FinanceDetailBillingV1;
    isLoading$: Observable<boolean>;

    public subs: Subscription;

    ngOnInit() {
        const { id } = this.route.snapshot.params;
        this.dataDetail$ = this.store.select(BillingDetailSelectors.getSelectedItem, id);
        this.isLoading$ = this.store.select(BillingDetailSelectors.getLoadingState);

        this.subs = this.dataDetail$.subscribe((res) => {
            this.dataDetail = res;
        });
    }

    btnApproved(val) {
        const dialogApproved = this.dialog.open(ApproveRejectCollectionBillingComponent, {
            width: '457px',
            data: { title: 'Approve Billing', type: 'billing', status: 'approved', value: val },
        });

        dialogApproved.afterClosed().subscribe((result) => {});
    }

    btnReject(val) {
        const dialogReject = this.dialog.open(ApproveRejectCollectionBillingComponent, {
            width: '457px',
            data: { title: 'Reject Billing', type: 'billing', status: 'reject', value: val },
        });

        dialogReject.afterClosed().subscribe((result) => {});
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
