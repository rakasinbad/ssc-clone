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
import * as StatusPaymentLabel from '../../../../constants';
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

    ngOnDestroy(): void {
        //unsubscribeAll
        this.subs.unsubscribe();
    }

    btnApproved(val) {
        const dialogApproved = this.dialog.open(ApproveRejectCollectionBillingComponent, {
            width: '457px',
            data: { title: 'Approve Billing', type: 'billing', status: 'approved', idDetail: this.idDetail, value: val },
        });

        dialogApproved.afterClosed().subscribe((result) => {});
    }

    onClickCollectionCode(val:number){
        this.router.navigateByUrl(`/pages/finances/collection/collection/${val}`);
    }

    btnReject(val) {
        //for fetch reject reason list
        this.store.dispatch(
            RejectReasonActions.fetchRejectReasonRequest({
                payload: { type: 'payment' },
            })
        );
        this.isLoadingRejectReason$ = this.store.select(RejectReasonSelectors.getLoadingState);

        const dialogReject = this.dialog.open(ApproveRejectCollectionBillingComponent, {
            width: '457px',
            data: { title: 'Reject Billing', type: 'billing', status: 'reject', idDetail: this.idDetail, value: val },
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

    statusLabelBilling(status) {
        switch (status) {
            case StatusPaymentLabel.VALUE_APPROVED_LABEL:
                return StatusPaymentLabel.STATUS_APPROVED_LABEL;
                break;
            case StatusPaymentLabel.VALUE_REJECTED_LABEL:
                return StatusPaymentLabel.STATUS_REJECTED_LABEL;
                break;
            case StatusPaymentLabel.VALUE_PENDING_LABEL:
                return StatusPaymentLabel.STATUS_WAITING_LABEL;
                break;
            default:
                return '-';
                break;
        }
    }

    statusLabelCollection(status) {
        switch (status) {
            case StatusPaymentLabel.VALUE_APPROVED_LABEL:
                return StatusPaymentLabel.STATUS_APPROVED_LABEL;
                break;
            case StatusPaymentLabel.VALUE_PENDING_LABEL:
                return StatusPaymentLabel.STATUS_WAITING_LABEL;
                break;
            case StatusPaymentLabel.VALUE_OVERDUE_LABEL:
                return StatusPaymentLabel.STATUS_OVERDUE_LABEL;
                break;
            case StatusPaymentLabel.VALUE_REJECTED_LABEL:
                return StatusPaymentLabel.STATUS_REJECTED_LABEL;
                break;
            case StatusPaymentLabel.VALUE_WAITING_LABEL:
                return StatusPaymentLabel.STATUS_WAITING_LABEL;
                break;
            case StatusPaymentLabel.VALUE_PAYMENT_FAILED_LABEL:
                return StatusPaymentLabel.STATUS_PAYMENT_FAILED_LABEL;
                break;
            case StatusPaymentLabel.VALUE_WAITING_PAYMENT_LABEL:
                return StatusPaymentLabel.STATUS_WAITING_PAYMENT_LABEL;
                break;
            case StatusPaymentLabel.VALUE_PAID_LABEL:
                return StatusPaymentLabel.STATUS_PAID_LABEL;
                break;
            default:
                return '-';
                break;
        }
    }
}