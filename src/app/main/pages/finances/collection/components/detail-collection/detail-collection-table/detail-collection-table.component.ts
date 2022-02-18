import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FinanceDetailCollection } from '../../../models';
import * as collectionStatus from '../../../store/reducers';
import { CollectionDetailSelectors } from '../../../store/selectors';
import * as StatusPaymentLabel from '../../../constants';
import { fuseAnimations } from '@fuse/animations';
import { MatDialog } from '@angular/material/dialog';
import { ModalDetailTableBillingComponent } from '../../modal/modal-detail-table-billing/modal-detail-table-billing.component';

@Component({
    selector: 'app-detail-collection-table',
    templateUrl: './detail-collection-table.component.html',
    styleUrls: ['./detail-collection-table.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
})
export class DetailCollectionTableComponent implements OnInit {
    detailCollection$: Observable<FinanceDetailCollection>;
    isLoading$: Observable<boolean>;

    displayedColumnsBilling = [
        'finance-billing-code',
        'finance-invoice-number',
        'finance-total-invoice-amount',
        'finance-invoice-due-date',
        'finance-amount-use',
        'finance-sales-rep',
        'finance-bill-status',
        'finance-reason',
        'finance-action',
    ];

    constructor(
        private store: Store<collectionStatus.FeatureState>,
        private dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.detailCollection$ = this.store.select(CollectionDetailSelectors.getSelectedItem);
        this.isLoading$ = this.store.select(CollectionDetailSelectors.getLoadingState);
    }

    openDetailRow(row) {
        const dialogRef = this.dialog.open(ModalDetailTableBillingComponent, {
            width: '882px',
            data: row
        });

        dialogRef.afterClosed().subscribe((result) => {
            // console.log('The dialog was closed');
        });
    }

    getOrderCode(value): string {
        if (value && value.length > 0) {
            const lengthValue = value.length;
            const orderCodes = value[0] + ' (+' + (lengthValue - 1) + ' more)';

            return orderCodes.length > 0 ? orderCodes : '-';
        }

        return '-';
    }

    getOrderRef(value): string {
        if (value && value.length > 0) {
            const lengthValue = value.length;
            const orderRefs = value[0] + ' (+' + (lengthValue - 1) + ' more)';

            return orderRefs.length > 0 ? orderRefs : '-';
        }

        return '-';
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

    numberFormatFromString(num) {
        let value = parseInt(num);
        if (num) {
            return value
                .toFixed(2)
                .replace('.', ',')
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        }

        return '-';
    }

    totalAmountFormat(num) {
        let value = parseInt(num);
        if (num) {
            return 'Rp' + value
                .toFixed(0)
                .replace('.', ',')
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        }

        return '0';
    }

    statusLabel(status) {
        switch (status) {
            case StatusPaymentLabel.VALUE_APPROVED_LABEL:
                return StatusPaymentLabel.STATUS_APPROVED_LABEL;
            case StatusPaymentLabel.VALUE_PENDING_LABEL:
                return StatusPaymentLabel.STATUS_WAITING_LABEL;
            case StatusPaymentLabel.VALUE_OVERDUE_LABEL:
                return StatusPaymentLabel.STATUS_OVERDUE_LABEL;
            case StatusPaymentLabel.VALUE_REJECTED_LABEL:
                return StatusPaymentLabel.STATUS_REJECTED_LABEL;
            case StatusPaymentLabel.VALUE_WAITING_LABEL:
                return StatusPaymentLabel.STATUS_WAITING_LABEL;
            case StatusPaymentLabel.VALUE_PAYMENT_FAILED_LABEL:
                return StatusPaymentLabel.STATUS_PAYMENT_FAILED_LABEL;
            case StatusPaymentLabel.VALUE_WAITING_PAYMENT_LABEL:
                return StatusPaymentLabel.STATUS_WAITING_PAYMENT_LABEL;
            case StatusPaymentLabel.VALUE_PAID_LABEL:
                return StatusPaymentLabel.STATUS_PAID_LABEL;
            default:
                return '-';
        }
    }
}
