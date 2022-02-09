import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatRadioChange } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { FinanceDetailBillingV1, RejectReason } from '../../../models';
import { RejectReasonSelectors, CollectionPhotoSelectors } from '../../../store/selectors';
import * as fromRejectReason from '../../../store/reducers';
import { Store } from '@ngrx/store';

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
    public payload: object | null;
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
            console.log('isi val->', val);
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
        console.log('value', event);
        if (event.isUserInput) {
            this.selectedValue = event.source.value;
            this.buttonRejectDisabled = false;
            if (type === 'collection') {
                this.payload = {
                    approvalStatus: 'rejected',
                    billingRef: '', // di set empty string
                    rejectReasonId: event.source.value, // int // approvalStatus = "rejected"  | default value , if not set
                };
            } else {
                this.payload = {
                    approvalStatus: 'rejected',
                    billingRef: '', // di set empty string
                    rejectReasonId: event.source.value, // int // approvalStatus = "rejected"  | default value , if not set
                };
            }
        }
    }

    onClickButton(type: string, status: string) {
        console.log('onClickButton', type, status);
        console.log('this.payload', this.payload);

        if (type == 'collection' && status == 'approved') {
            //fetch approve collection
        }
        if (type == 'billing' && status == 'rejected') {
            //fetch rejected collection
        }
        if (type == 'collection' && status == 'approved') {
            //fetch approve billing
        }
        if (type == 'billing' && status == 'rejected') {
            //fetch rejected billing
        }
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}
