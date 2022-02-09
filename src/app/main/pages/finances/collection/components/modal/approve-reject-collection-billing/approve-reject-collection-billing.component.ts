import { Component, Inject, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import * as fromRejectReason from '../../../store/reducers';
import { RejectReasonSelectors, CollectionPhotoSelectors } from '../../../store/selectors';
import { RejectReason } from '../../../models';
import { Observable, Subscription } from 'rxjs';

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
export class ApproveRejectCollectionBillingComponent implements OnInit, OnDestroy {
    public title: string;
    public type: string;
    public status: string;
    selectedValue: string;
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

        this.rejectReasonList$ = this.store.select(RejectReasonSelectors.selectAll);
        this.subs = this.rejectReasonList$.subscribe((val) => {
            this.listReason = val;
            console.log('isi val->', val)
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

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}
