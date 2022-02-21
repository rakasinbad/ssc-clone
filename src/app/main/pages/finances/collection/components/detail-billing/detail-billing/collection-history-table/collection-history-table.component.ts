import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Store } from '@ngrx/store';
import { Console } from 'console';
import { Observable, Subscription } from 'rxjs';
import { FinanceDetailBillingV1 } from '../../../../models';
import { RejectReasonActions } from '../../../../store/actions';
import * as billingStatus from '../../../../store/reducers';
import { BillingDetailSelectors, RejectReasonSelectors } from '../../../../store/selectors';
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
        private router: Router,
        private dialog: MatDialog
    ) {}
    dataDetail$: Observable<FinanceDetailBillingV1>;
    dataDetail: FinanceDetailBillingV1;
    isLoading$: Observable<boolean>;
    isLoadingRejectReason$: Observable<boolean>;

    public subs: Subscription;

    @Input() idDetail:any;

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
            data: { title: 'Approve Billing', type: 'billing', status: 'approved', idDetail: this.idDetail, value: val },
        });

        dialogApproved.afterClosed().subscribe((result) => {});
    }

    btnReject(val) {
        //for fetch reject reason list
        this.store.dispatch(
            RejectReasonActions.fetchRejectReasonRequest({
                payload: { type: 'collection' },
            })
        );
        this.isLoadingRejectReason$ = this.store.select(RejectReasonSelectors.getLoadingState);

        const dialogReject = this.dialog.open(ApproveRejectCollectionBillingComponent, {
            width: '457px',
            data: { title: 'Reject Billing', type: 'billing', status: 'reject', idDetail: this.idDetail, value: val },
        });

        dialogReject.afterClosed().subscribe((result) => {
            if (result != undefined && result.status !== 'cancel') {
                // console.log("result", result)
            }
        });
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
