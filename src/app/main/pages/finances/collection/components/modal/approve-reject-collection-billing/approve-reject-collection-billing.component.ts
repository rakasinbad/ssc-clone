import { Component, Inject, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatRadioChange } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { PaymColApprove, RejectReason, PaymApproval } from '../../../models';
import { RejectReasonSelectors, CollectionPhotoSelectors } from '../../../store/selectors';
import * as fromRejectReason from '../../../store/reducers';
import { Store } from '@ngrx/store';
import { RejectReasonActions } from '../../../store/actions';

interface Reason {
    id: number;
    reason: string;
}

@Component({
    selector: 'app-approve-reject-collection-billing',
    templateUrl: './approve-reject-collection-billing.component.html',
    styleUrls: ['./approve-reject-collection-billing.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ApproveRejectCollectionBillingComponent implements OnInit {
    public title: string;
    public type: string;
    public status: string;
    public selectedValue: string;
    public payload: PaymApproval | null;
    public payloadCollection: PaymColApprove | null;
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
        this.isLoading$ = this.store.select(RejectReasonSelectors.getLoadingState)

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
                this.payloadCollection = {
                    approvalStatus: 'rejected',
                    collectionRef: '', // di set empty string
                };
            } else {
                this.payload = {
                    approvalStatus: 'rejected',
                    billingRef: '', // di set empty string
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
                        body: {
                            approvalStatus: 'approved',
                            collectionRef: '', // di set empty string
                        }
                    }
                })
            );
        }
        if (type == 'collection' && status == 'reject') {
            //fetch rejected collection
            this.store.dispatch(
                RejectReasonActions.updateColPaymentRejectRequest({
                    payload: {
                        id: this.data.value.data.id,
                        body: {
                            ...this.payloadCollection,
                            rejectedReasonId: Number(this.selectedValue)
                        }
                    }
                })
            );
        }
        if (type == 'billing' && status == 'approved') {
            //fetch approve billing
            this.store.dispatch(
                RejectReasonActions.updateBillingPaymentApprovalRequest({
                    payload: {
                        id: this.data.value,
                        body: {
                            approvalStatus: 'approved',
                            billingRef: '', // di set empty string
                        }
                    }
                })
            );
        }
        if (type == 'billing' && status == 'reject') {
            // idDetail
            //fetch rejected billing
            this.store.dispatch(
                RejectReasonActions.updateBillingPaymentRejectRequest({
                    payload: {
                        id: this.data.value,
                        body: {
                            ...this.payload,
                            rejectedReasonId: this.selectedValue
                        }
                    }
                })
            );
        }
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}
