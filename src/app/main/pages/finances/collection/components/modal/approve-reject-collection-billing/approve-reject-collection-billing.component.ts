import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatRadioChange } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { FinanceDetailBillingV1, RejectReason, PaymApproval } from '../../../models';
import { RejectReasonSelectors, CollectionPhotoSelectors } from '../../../store/selectors';
import * as fromRejectReason from '../../../store/reducers';
import { Store } from '@ngrx/store';
import { CollectionActions, RejectReasonActions } from '../../../store/actions';

interface Reason {
    id: number;
    reason: string;
}

@Component({
    selector: 'app-approve-reject-collection-billing',
    templateUrl: './approve-reject-collection-billing.component.html',
    styleUrls: ['./approve-reject-collection-billing.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApproveRejectCollectionBillingComponent implements OnInit {
    public title: string;
    public type: string;
    public status: string;
    public selectedValue: string;
    public payload: PaymApproval | null;
    public buttonRejectDisabled: boolean;
    rejectReasonList$: Observable<Array<RejectReason>>;
    isLoading$: Observable<boolean>;
    subs: Subscription;
    listReason = [];

    reasonList: Reason[] = [
        { id: 1, reason: 'Empty Giro' },
        { id: 2, reason: 'Empty Check' },
        { id: 3, reason: 'Actual Cash Inapropriate' },
        { id: 4, reason: 'Others' },
    ];

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private store: Store<fromRejectReason.FeatureState>
    ) {}

    ngOnInit() {
        this.type = this.data.type;
        this.title = this.data.title;
        this.status = this.data.status;
        this.buttonRejectDisabled = true;
        this.rejectReasonList$ = this.store.select(RejectReasonSelectors.selectAll);
        this.subs = this.rejectReasonList$.subscribe((val) => {
            this.listReason = val;
        });
    }

    numberFormat(num) {
        if (num) {
            return (
                'Rp' +
                num
                    .toFixed(2)
                    .replace('.', ',')
                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
            );
        }

        return '-';
    }

    onSelectEvent(event: any, type: string, id: string) {
        if (event.isUserInput) {
            this.selectedValue = event.source.value;
            this.buttonRejectDisabled = false;
            if (type === 'collection') {
                this.payload = {
                    approvalStatus: 'rejected',
                    billingRef: '', // di set empty string
                    rejectedReasonId: event.source.value, // int // approvalStatus = "rejected"  | default value , if not set
                };
            } else {
                this.payload = {
                    approvalStatus: 'rejected',
                    billingRef: '', // di set empty string
                    rejectedReasonId: event.source.value, // int // approvalStatus = "rejected"  | default value , if not set
                };
            }
        }
    }

    onClickButton(type: string, status: string) {
        if (type == 'collection' && status == 'approved') {
            //fetch approve collection
            this.store.dispatch(
                RejectReasonActions.updateColPaymentApprovalRequest({
                    payload: {
                        id: this.data.value.data.id,
                        body: this.payload
                    }
                })
            );
        }
        if (type == 'collection' && status == 'reject') {
            //fetch rejected collection
            this.store.dispatch(
                RejectReasonActions.updateColPaymentApprovalRequest({
                    payload: {
                        id: this.data.value.data.id,
                        body: this.payload
                    }
                })
            );
        }
        if (type == 'billing' && status == 'approved') {
            //fetch approve billing
            this.store.dispatch(
                RejectReasonActions.updateBillingPaymentApprovalRequest({
                    payload: {
                        id: this.data.value.collectionHistoryId,
                        body: this.payload
                    }
                })
            );
        }
        if (type == 'billing' && status == 'rejected') {
            //fetch rejected billing
            this.store.dispatch(
                RejectReasonActions.updateBillingPaymentApprovalRequest({
                    payload: {
                        id: this.data.value.collectionHistoryId,
                        body: this.payload
                    }
                })
            );
        }
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}
