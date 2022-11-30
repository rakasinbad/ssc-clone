import { Component, Inject, OnInit, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy } from '@angular/core';
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
export class ApproveRejectCollectionBillingComponent implements OnInit,OnDestroy {
    public title: string;
    public type: string;
    public status: string;
    public selectedValue: string;
    public payloadBilling: any;
    public payloadCollection: PaymColApprove | null;
    public buttonRejectDisabled: boolean;
    public collectionRef: string = '';
    public billingPaymentId: number = null;

    rejectReasonList$: Observable<Array<RejectReason>>;
    isLoading$: Observable<boolean>;
    subs: Subscription;
    listReason = [];

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

        if (this.data.value.paymentCollectionMethod) {
            this.collectionRef = this.data.value.paymentCollectionMethod.collectionRef;
        }
        if(this.data.value.billingPaymentId){
            this.billingPaymentId = parseInt(this.data.value.billingPaymentId);
        }
    }

    numberFormat(num) {
        if (num) {
            return 'Rp' + num
                .toFixed(0)
                .replace('.', ',')
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
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
                    collectionRef: this.collectionRef, // di set empty string
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
                        id: this.data.value.id,
                        body: {
                            approvalStatus: 'approved',
                            collectionRef: this.collectionRef, // di set empty string
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
                        id: this.data.value.id,
                        body: {
                            ...this.payloadCollection,
                            rejectReasonId: Number(this.selectedValue)
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
                        id: this.billingPaymentId,
                        body: {
                            approvalStatus: 'approved',
                            billingRef: ''
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
                        id: this.billingPaymentId,
                        body: {
                            approvalStatus: 'rejected',
                            billingRef: '',
                            rejectReasonId: this.selectedValue
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
